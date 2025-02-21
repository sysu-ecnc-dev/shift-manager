package scheduler

import (
	"fmt"
	"math"
	"math/rand"
	"sort"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

type Scheduler struct {
	parameters   *Parameters
	users        []*domain.User // 注意这个不是所有的 users，而应该是提交了空闲时间的助理
	shifts       []*domain.ScheduleTemplateShift
	submissions  []*domain.AvailabilitySubmission // 仅做最后的校验使用
	availableMap map[int64]map[int32][]int64      // {shiftID: {day: [userID1, userID2, ...]}}
}

func New(parameters *Parameters, users []*domain.User, template *domain.ScheduleTemplate, availableSubmissions []*domain.AvailabilitySubmission) (*Scheduler, error) {
	s := &Scheduler{
		parameters:   parameters,
		users:        make([]*domain.User, 0),
		shifts:       make([]*domain.ScheduleTemplateShift, 0),
		submissions:  availableSubmissions,
		availableMap: make(map[int64]map[int32][]int64),
	}

	for _, shift := range template.Shifts {
		s.shifts = append(s.shifts, &shift)
	}

	for _, submission := range availableSubmissions {
		userID := submission.UserID

		for _, item := range submission.Items {
			shiftID := item.ShiftID

			if _, exists := s.availableMap[shiftID]; !exists {
				s.availableMap[shiftID] = map[int32][]int64{}
			}

			for _, day := range item.Days {
				if _, exists := s.availableMap[shiftID][day]; !exists {
					s.availableMap[shiftID][day] = []int64{}
				}

				s.availableMap[shiftID][day] = append(s.availableMap[shiftID][day], userID)
			}
		}

		var user *domain.User = nil
		for _, u := range users {
			if u.ID == userID {
				user = u
				break
			}
		}

		if user == nil {
			return nil, fmt.Errorf("用户 %d 不在传入的 users 数组中", userID)
		}

		s.users = append(s.users, user)
	}

	return s, nil
}

func (s *Scheduler) Schedule() ([]*domain.SchedulingResultShift, error) {
	// 生成初始种群
	pop := make([]*Chromosome, s.parameters.PopulationSize)
	for i := 0; i < int(s.parameters.PopulationSize); i++ {
		pop[i] = s.randomInitChromosome()
		s.calcFitness(pop[i])
	}

	// 迭代
	bestChromosomeEver := &Chromosome{
		genes:   nil,
		fitness: -math.MaxFloat64,
	}

	for gen := 0; gen < int(s.parameters.MaxGenerations); gen++ {
		// 找到本代最佳样本
		genBestFit := pop[0].fitness
		genBestIndex := 0

		for i := 1; i < int(s.parameters.PopulationSize); i++ {
			if pop[i].fitness > genBestFit {
				genBestFit = pop[i].fitness
				genBestIndex = i
			}
		}

		if genBestFit > bestChromosomeEver.fitness {
			bestChromosomeEver.fitness = genBestFit
			// 这里需要使用深拷贝，防止后续繁殖的过程中导致指向的基因被修改
			bestChromosomeEver.genes = make([]*Gene, len(pop[genBestIndex].genes))
			for i := 0; i < len(pop[genBestIndex].genes); i++ {
				bestChromosomeEver.genes[i] = &Gene{
					shiftID:      pop[genBestIndex].genes[i].shiftID,
					day:          pop[genBestIndex].genes[i].day,
					principalID:  pop[genBestIndex].genes[i].principalID,
					assistantIDs: make([]int64, len(pop[genBestIndex].genes[i].assistantIDs)),
					requiredNum:  pop[genBestIndex].genes[i].requiredNum,
					workDuration: pop[genBestIndex].genes[i].workDuration,
				}
				copy(bestChromosomeEver.genes[i].assistantIDs, pop[genBestIndex].genes[i].assistantIDs)
			}
		}

		// 繁殖
		newPop := make([]*Chromosome, 0, s.parameters.PopulationSize)

		// 保留精英
		sort.Slice(pop, func(i, j int) bool {
			return pop[i].fitness > pop[j].fitness
		})
		newPop = append(newPop, pop[:int(s.parameters.EliteCount)]...)

		// 在剩余的染色体中进行交叉和变异
		for len(newPop) < int(s.parameters.PopulationSize) {
			// 选择两个父本
			p1 := s.selectByRoulette(pop)
			p2 := s.selectByRoulette(pop)

			if rand.Float64() < s.parameters.CrossoverRate {
				s.singlePointCrossover(p1, p2)
			}

			s.mutate(p1)
			s.mutate(p2)

			newPop = append(newPop, p1)

			if len(newPop) < int(s.parameters.PopulationSize) {
				newPop = append(newPop, p2)
			}
		}

		for i := 0; i < int(s.parameters.PopulationSize); i++ {
			pop[i] = newPop[i]
			s.calcFitness(pop[i])
		}
	}

	// 返回结果
	result := make([]*domain.SchedulingResultShift, 0, len(bestChromosomeEver.genes))
	resultMap := make(map[int64][]domain.SchedulingResultShiftItem)
	for _, gene := range bestChromosomeEver.genes {
		if _, exists := resultMap[gene.shiftID]; !exists {
			resultMap[gene.shiftID] = make([]domain.SchedulingResultShiftItem, 0)
		}
		resultMap[gene.shiftID] = append(resultMap[gene.shiftID], domain.SchedulingResultShiftItem{
			Day:          gene.day,
			PrincipalID:  gene.principalID,
			AssistantIDs: gene.assistantIDs,
		})
	}

	for shiftID, items := range resultMap {
		result = append(result, &domain.SchedulingResultShift{
			ShiftID: shiftID,
			Items:   items,
		})
	}

	// 还需要检查一下结果是否满足约束条件（调用 validate 包中的方法就可以了）
	schedulingResult := &domain.SchedulingResult{
		Shifts: make([]domain.SchedulingResultShift, len(result)),
	}
	for i, shift := range result {
		schedulingResult.Shifts[i] = *shift
	}

	if err := utils.ValidateSchedulingResultWithSubmissions(schedulingResult, s.submissions); err != nil {
		return nil, err
	}
	if err := utils.ValidIfExistsDuplicateAssistant(schedulingResult); err != nil {
		return nil, err
	}

	return result, nil
}
