package scheduler

import (
	"math"
	"math/rand"
	"slices"
	"time"
)

// randomInitChromosome 随机初始化一个染色体
func (s *Scheduler) randomInitChromosome() *Chromosome {
	var genes []*Gene

	for _, shift := range s.shifts {
		for _, day := range shift.ApplicableDays {
			var principalID *int64 = nil

			// 选出可以担当此 (shift, day) 的负责人候选
			var principalCandidatesIDs []int64 = []int64{}
			for _, user := range s.users {
				if isSeniorOrBlackCore(user) && slices.Contains(s.availableMap[shift.ID][day], user.ID) {
					principalCandidatesIDs = append(principalCandidatesIDs, user.ID)
				}
			}

			// 随机选出一个负责人
			if len(principalCandidatesIDs) > 0 {
				principalID = &principalCandidatesIDs[rand.Intn(len(principalCandidatesIDs))]
			}

			// 找出可以在 (shift, day) 中值班的剩余助理候选
			var assistantCandidatesIDs []int64 = []int64{}
			for _, user := range s.users {
				if slices.Contains(s.availableMap[shift.ID][day], user.ID) {
					if principalID != nil && *principalID == user.ID {
						// 确保已经被选为负责人的助理，不会在这一轮中被选中
						continue
					}
					assistantCandidatesIDs = append(assistantCandidatesIDs, user.ID)
				}
			}

			// 随机选择助理
			chosenNum := min(int(shift.RequiredAssistantNumber-1), len(assistantCandidatesIDs))
			// 打乱助理候选顺序
			rand.Shuffle(len(assistantCandidatesIDs), func(i, j int) {
				assistantCandidatesIDs[i], assistantCandidatesIDs[j] = assistantCandidatesIDs[j], assistantCandidatesIDs[i]
			})
			chosenAssistantIDs := assistantCandidatesIDs[:chosenNum]

			// 计算工作时长
			startTime, _ := time.Parse("15:04:05", shift.StartTime)
			endTime, _ := time.Parse("15:04:05", shift.EndTime)
			workDuration := endTime.Sub(startTime).Hours()

			// 生成基因
			genes = append(genes, &Gene{
				shiftID:      shift.ID,
				day:          day,
				principalID:  principalID,
				assistantIDs: chosenAssistantIDs,
				requiredNum:  shift.RequiredAssistantNumber,
				workDuration: workDuration,
			})
		}
	}

	return &Chromosome{
		genes: genes,
	}
}

/**
 * 计算染色体的适应度
 * fitness = - notWorkPenalty - FairnessWeight * fairnessPenalty
 * 其中:
 * 		1. notWorkPenalty 为未工作惩罚（用于确保每个用户都尽可能工作）
 * 		2. fairnessPenalty 为公平性惩罚（用于确保每个用户的工作量尽可能均衡）
 * 		3. FairnessWeight 为公平性权重，用于平衡覆盖率和公平性（由输入参数决定）
 */
func (s *Scheduler) calcFitness(ch *Chromosome) {

	// 计算每个助理的工作时长
	userWorkCnt := make(map[int64]float64)

	for _, gene := range ch.genes {
		// 计算每个助理的工作时长
		if gene.principalID != nil {
			if _, exists := userWorkCnt[*gene.principalID]; !exists {
				userWorkCnt[*gene.principalID] = 0
			}
			userWorkCnt[*gene.principalID] += gene.workDuration
		}
		for _, assistantID := range gene.assistantIDs {
			if _, exists := userWorkCnt[assistantID]; !exists {
				userWorkCnt[assistantID] = 0
			}
			userWorkCnt[assistantID] += gene.workDuration
		}
	}

	// 计算 notWorkPenalty
	notWorkPenalty := 0.0
	for _, workCnt := range userWorkCnt {
		if workCnt == 0 {
			notWorkPenalty += 1
		}
	}

	// 计算 fairnessPenalty（即方差）
	variance := 0.0
	avgWorkCnt := 0.0

	for _, workCnt := range userWorkCnt {
		avgWorkCnt += workCnt
	}
	avgWorkCnt /= float64(len(userWorkCnt))

	for _, workCnt := range userWorkCnt {
		variance += math.Pow(workCnt-avgWorkCnt, 2)
	}
	variance /= float64(len(userWorkCnt))

	// 计算 fitness 并赋值给染色体
	fitness := -notWorkPenalty - s.parameters.FairnessWeight*variance
	ch.fitness = fitness
}

// 使用轮盘赌来进行选择
func (s *Scheduler) selectByRoulette(pop []*Chromosome) *Chromosome {
	sumFit := 0.0
	for _, ch := range pop {
		sumFit += ch.fitness
	}
	pick := rand.Float64() * sumFit
	partial := 0.0

	for _, ch := range pop {
		partial += ch.fitness
		if partial >= pick {
			return ch
		}
	}

	// 理论上不会运行到这个地方
	return pop[len(pop)-1]
}

// 单点交叉
func (s *Scheduler) singlePointCrossover(ch1 *Chromosome, ch2 *Chromosome) {
	length1 := len(ch1.genes)
	length2 := len(ch2.genes)

	if length1 != length2 {
		// 按理来说两个染色体的长度应该能保证是相等的
		// 这里只是以防万一
		return
	}

	length := length1

	// 随机选择一个位置
	point := rand.Intn(length)

	// 交换两个染色体在 point 位置之后的基因
	for i := point; i < length; i++ {
		ch1.genes[i], ch2.genes[i] = ch2.genes[i], ch1.genes[i]
	}
}

// 变异
// 随机选择新的负责人或助理
func (s *Scheduler) mutate(ch *Chromosome) {
	for i := range ch.genes {
		// 一定概率选择选择新的负责人
		if rand.Float64() > s.parameters.MutationRate {
			continue
		}

		var principalCandidatesIDs []int64 = []int64{}
		for _, user := range s.users {
			if isSeniorOrBlackCore(user) && slices.Contains(s.availableMap[ch.genes[i].shiftID][ch.genes[i].day], user.ID) {
				if ch.genes[i].principalID != nil && *ch.genes[i].principalID == user.ID {
					// 如果这个用户已经是负责人，那么就不要把他放入候选中了
					continue
				}
				if slices.Contains(ch.genes[i].assistantIDs, user.ID) {
					// 如果这个用户已经被选到这个班次中当助理了，那么就不要把它放入候选了
					continue
				}

				principalCandidatesIDs = append(principalCandidatesIDs, user.ID)
			}
		}

		if len(principalCandidatesIDs) > 0 {
			ch.genes[i].principalID = &principalCandidatesIDs[rand.Intn(len(principalCandidatesIDs))]
		}

		// 一定概率选择新的助理
		for j := range ch.genes[i].assistantIDs {
			// 每个助理都有一定概率被替换
			if rand.Float64() > s.parameters.MutationRate {
				continue
			}

			var assistantCandidatesIDs []int64 = []int64{}

			for _, user := range s.users {
				if slices.Contains(s.availableMap[ch.genes[i].shiftID][ch.genes[i].day], user.ID) {
					if ch.genes[i].principalID != nil && *ch.genes[i].principalID == user.ID {
						// 如果这个用户是负责人，那么就不要把他放入候选中了
						continue
					}
					if slices.Contains(ch.genes[i].assistantIDs, user.ID) {
						// 如果这个用户已经被选到这个班次中当助理了，那么就不要把它放入候选了
						continue
					}

					assistantCandidatesIDs = append(assistantCandidatesIDs, user.ID)
				}
			}

			if len(assistantCandidatesIDs) > 0 {
				ch.genes[i].assistantIDs[j] = assistantCandidatesIDs[rand.Intn(len(assistantCandidatesIDs))]
			}
		}
	}
}
