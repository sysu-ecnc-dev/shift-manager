package scheduler

// Gene: 表示对某个 (shift, day) 的排班决策
type Gene struct {
	shiftID      int64
	day          int32
	principalID  *int64  // 如果 PrincipalID 为 nil，则表示这个 (shift, day) 没有负责人
	assistantIDs []int64 // 如果 AssistantIDs 为空，则表示这个 (shift, day) 没有助理
	requiredNum  int32
	workDuration float64
}

// Chromosome: 整个排班表
type Chromosome struct {
	genes   []*Gene
	fitness float64
}

// 遗传算法参数
type Parameters struct {
	PopulationSize int32   // 种群大小
	MaxGenerations int32   // 最大迭代次数
	CrossoverRate  float64 // 交叉概率
	MutationRate   float64 // 变异概率
	EliteCount     int32   // 精英数量
	FairnessWeight float64 // 公平性权重
}
