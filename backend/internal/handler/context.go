package handler

type ContextKey string

var (
	RoleCtxKey                       ContextKey = "role"
	SubCtxKey                        ContextKey = "sub"
	MyInfoCtx                        ContextKey = "myInfo"
	UserInfoCtx                      ContextKey = "userInfo"
	ScheduleTemplateMetaCtx          ContextKey = "scheduleTemplateMeta"
	ScheduleTemplateCtx              ContextKey = "scheduleTemplate"
	SchedulePlanCtx                  ContextKey = "schedulePlan"
	LatestSubmissionAvailablePlanCtx ContextKey = "latestSubmissionAvailablePlan"
)
