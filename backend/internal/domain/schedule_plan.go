package domain

import "time"

type SchedulePlanStatus string

const (
	SchedulePlanStatusNotStarted          SchedulePlanStatus = "未开始"
	SchedulePlanStatusSubmissionAvailable SchedulePlanStatus = "开放提交"
	SchedulePlanStatusScheduling          SchedulePlanStatus = "排班中"
	SchedulePlanStatusActive              SchedulePlanStatus = "生效中"
	SchedulePlanStatusEnded               SchedulePlanStatus = "已结束"
)

type SchedulePlan struct {
	ID                   int64              `json:"id"`
	Name                 string             `json:"name"`
	Description          string             `json:"description"`
	SubmissionStartTime  time.Time          `json:"submissionStartTime"`
	SubmissionEndTime    time.Time          `json:"submissionEndTime"`
	ActiveStartTime      time.Time          `json:"activeStartTime"`
	ActiveEndTime        time.Time          `json:"activeEndTime"`
	ScheduleTemplateName string             `json:"scheduleTemplateName"` // 应用层应该返回模板名，而不是模板 id
	Status               SchedulePlanStatus `json:"status"`               // 状态不保存到数据库，由专门的函数来计算目前的排班计划的状态
	CreatedAt            time.Time          `json:"createdAt"`
	Version              int32              `json:"-"`
}
