package handler

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/scheduler"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/utils"
)

func (h *Handler) CreateSchedulePlan(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name                string    `json:"name" validate:"required"`
		Description         string    `json:"description"`
		SubmissionStartTime time.Time `json:"submissionStartTime" validate:"required"`
		SubmissionEndTime   time.Time `json:"submissionEndTime" validate:"required"`
		ActiveStartTime     time.Time `json:"activeStartTime" validate:"required"`
		ActiveEndTime       time.Time `json:"activeEndTime" validate:"required"`
		TemplateID          int64     `json:"templateID" validate:"required"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	plan := &domain.SchedulePlan{
		Name:                req.Name,
		Description:         req.Description,
		SubmissionStartTime: req.SubmissionStartTime,
		SubmissionEndTime:   req.SubmissionEndTime,
		ActiveStartTime:     req.ActiveStartTime,
		ActiveEndTime:       req.ActiveEndTime,
		ScheduleTemplateID:  req.TemplateID,
	}

	// 检查 plan 的时间是否合法
	if err := utils.ValidateSchedulePlanTime(plan); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 插入数据到数据库中
	if err := h.repository.CreateSchedulePlan(plan); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_plans_name_key":
				h.errorResponse(w, r, "排班计划名称已存在")
			case "schedule_plans_schedule_template_id_fkey":
				h.errorResponse(w, r, "排班计划模板不存在")
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "创建排班计划成功", plan)
}

func (h *Handler) GetSchedulePlanByID(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	h.successResponse(w, r, "获取排班计划成功", plan)
}

func (h *Handler) DeleteSchedulePlan(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	if err := h.repository.DeleteSchedulePlan(plan.ID); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "删除排班计划成功", nil)
}

func (h *Handler) UpdateSchedulePlan(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	var req struct {
		Name                *string    `json:"name"`
		Description         *string    `json:"description"`
		SubmissionStartTime *time.Time `json:"submissionStartTime"`
		SubmissionEndTime   *time.Time `json:"submissionEndTime"`
		ActiveStartTime     *time.Time `json:"activeStartTime"`
		ActiveEndTime       *time.Time `json:"activeEndTime"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 将输入的参数解析到 plan 中
	if req.Name != nil {
		plan.Name = *req.Name
	}
	if req.Description != nil {
		plan.Description = *req.Description
	}
	if req.SubmissionStartTime != nil {
		plan.SubmissionStartTime = *req.SubmissionStartTime
	}
	if req.SubmissionEndTime != nil {
		plan.SubmissionEndTime = *req.SubmissionEndTime
	}
	if req.ActiveStartTime != nil {
		plan.ActiveStartTime = *req.ActiveStartTime
	}
	if req.ActiveEndTime != nil {
		plan.ActiveEndTime = *req.ActiveEndTime
	}

	// 检查 plan 的时间是否合法
	if err := utils.ValidateSchedulePlanTime(plan); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 更新排班计划
	if err := h.repository.UpdateSchedulePlan(plan); err != nil {
		var pgErr *pgconn.PgError
		switch {
		case errors.As(err, &pgErr):
			switch pgErr.ConstraintName {
			case "schedule_plans_name_key":
				h.errorResponse(w, r, "排班计划名称已存在")
			default:
				h.internalServerError(w, r, err)
			}
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "更新排班计划成功", plan)
}

func (h *Handler) GetAllSchedulePlans(w http.ResponseWriter, r *http.Request) {
	plans, err := h.repository.GetAllSchedulePlans()
	if err != nil {
		h.internalServerError(w, r, err)
	}

	h.successResponse(w, r, "获取所有排班计划成功", plans)
}

func (h *Handler) SubmitYourAvailability(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*domain.User)
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	var req []struct {
		ShiftID int64   `json:"shiftID" validate:"required"`
		Days    []int32 `json:"days" validate:"required,dive,min=1,max=7"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := h.validate.Var(req, "required,dive"); err != nil {
		h.badRequest(w, r, err)
		return
	}

	submission := &domain.AvailabilitySubmission{
		SchedulePlanID: plan.ID,
		UserID:         myInfo.ID,
		Items:          make([]domain.AvailabilitySubmissionItem, len(req)),
	}

	for i, item := range req {
		submission.Items[i] = domain.AvailabilitySubmissionItem{
			ShiftID: item.ShiftID,
			Days:    item.Days,
		}
	}

	// 还需要检查模板和提交的格式是否对的上
	template, err := h.repository.GetScheduleTemplate(plan.ScheduleTemplateID)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	if err := utils.ValidateSubmissionWithTemplate(submission, template); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := h.repository.InsertAvailabilitySubmission(submission); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "成功提交空闲时间", submission)
}

func (h *Handler) GetYourAvailabilitySubmission(w http.ResponseWriter, r *http.Request) {
	myInfo := r.Context().Value(MyInfoCtx).(*domain.User)
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	submission, err := h.repository.GetAvailabilitySubmissionByUserIDAndSchedulePlanID(myInfo.ID, plan.ID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			h.successResponse(w, r, "你还没有提交过空闲时间", nil)
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "获取空闲时间提交成功", submission)
}

func (h *Handler) GetSchedulePlanSubmissions(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	submissions, err := h.repository.GetAllSubmissionsBySchedulePlanID(plan.ID)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "获取该排班计划所有的提交记录成功", submissions)
}

func (h *Handler) SubmitSchedulingResult(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	var req []struct {
		ShiftID int64 `json:"shiftID" validate:"required"`
		Items   []struct {
			Day          int32   `json:"day" validate:"required,min=1,max=7"`
			PrincipalID  *int64  `json:"principalID"`
			AssistantIDs []int64 `json:"assistantIDs" validate:"required"`
		} `json:"items" validate:"required,dive"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Var(req, "required,dive"); err != nil {
		h.badRequest(w, r, err)
		return
	}

	schedulingResult := &domain.SchedulingResult{
		SchedulePlanID: plan.ID,
		Shifts:         make([]domain.SchedulingResultShift, len(req)),
	}

	for i, shift := range req {
		schedulingResult.Shifts[i] = domain.SchedulingResultShift{
			ShiftID: shift.ShiftID,
			Items:   make([]domain.SchedulingResultShiftItem, len(shift.Items)),
		}

		for j, item := range shift.Items {
			schedulingResult.Shifts[i].Items[j] = domain.SchedulingResultShiftItem{
				Day:          item.Day,
				AssistantIDs: item.AssistantIDs,
				PrincipalID:  item.PrincipalID,
			}
		}
	}

	// 必须检查提交的结果是否和模板对的上
	template, err := h.repository.GetScheduleTemplate(plan.ScheduleTemplateID)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	if err := utils.ValidateSchedulingResultWithTemplate(schedulingResult, template); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 还要检查提交的结果是否和助理提交的结果对的上
	submissions, err := h.repository.GetAllSubmissionsBySchedulePlanID(plan.ID)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	if err := utils.ValidateSchedulingResultWithSubmissions(schedulingResult, submissions); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 最后要检查是否存在重复的助理
	if err := utils.ValidIfExistsDuplicateAssistant(schedulingResult); err != nil {
		h.badRequest(w, r, err)
		return
	}

	if err := h.repository.InsertSchedulingResult(schedulingResult); err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "提交排班结果成功", schedulingResult)
}

func (h *Handler) GetSchedulingResult(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	schedulingResult, err := h.repository.GetSchedulingResultBySchedulePlanID(plan.ID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			h.successResponse(w, r, "该排班计划还没有排班结果", nil)
		default:
			h.internalServerError(w, r, err)
		}
		return
	}

	h.successResponse(w, r, "获取排班结果成功", schedulingResult)
}

func (h *Handler) GenerateSchedulingResult(w http.ResponseWriter, r *http.Request) {
	plan := r.Context().Value(SchedulePlanCtx).(*domain.SchedulePlan)

	// 获取参数
	var req struct {
		PopulationSize int32   `json:"populationSize" validate:"required,min=1"`
		MaxGenerations int32   `json:"maxGenerations" validate:"required,min=1"`
		CrossoverRate  float64 `json:"crossoverRate" validate:"required,min=0,max=1"`
		MutationRate   float64 `json:"mutationRate" validate:"required,min=0,max=1"`
		EliteCount     int32   `json:"eliteCount" validate:"required,min=0"`
		FairnessWeight float64 `json:"fairnessWeight" validate:"required,min=0"`
	}

	if err := h.readJSON(r, &req); err != nil {
		h.badRequest(w, r, err)
		return
	}
	if err := h.validate.Struct(req); err != nil {
		h.badRequest(w, r, err)
		return
	}

	// 构建参数
	parameters := &scheduler.Parameters{
		PopulationSize: req.PopulationSize,
		MaxGenerations: req.MaxGenerations,
		CrossoverRate:  req.CrossoverRate,
		MutationRate:   req.MutationRate,
		EliteCount:     req.EliteCount,
		FairnessWeight: req.FairnessWeight,
	}

	// 获取排班计划所用的模板
	template, err := h.repository.GetScheduleTemplate(plan.ScheduleTemplateID)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 获取排班计划的提交记录
	submissions, err := h.repository.GetAllSubmissionsBySchedulePlanID(plan.ID)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 获取排班计划所用的用户
	users, err := h.repository.GetAllUsers()
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	// 自动排班
	scheduler, err := scheduler.New(parameters, users, template, submissions)
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	res, err := scheduler.Schedule()
	if err != nil {
		h.internalServerError(w, r, err)
		return
	}

	h.successResponse(w, r, "自动排班成功", res)
}
