package seed

import (
	"database/sql"
	"encoding/csv"
	"errors"
	"io"
	"log/slog"
	"os"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
)

var ShiftHeaderMap = map[string]domain.ScheduleTemplateShift{
	"09：00-10：00": {
		StartTime:               "09:00:00",
		EndTime:                 "10:00:00",
		RequiredAssistantNumber: 5,
		ApplicableDays:          []int32{1, 2, 3, 4, 5, 6},
	},
	"10：00-12：00": {
		StartTime:               "10:00:00",
		EndTime:                 "12:00:00",
		RequiredAssistantNumber: 5,
		ApplicableDays:          []int32{1, 2, 3, 4, 5, 6},
	},
	"13：30-16：10": {
		StartTime:               "13:30:00",
		EndTime:                 "16:10:00",
		RequiredAssistantNumber: 5,
		ApplicableDays:          []int32{1, 2, 3, 4, 5},
	},
	"16：10-18：00": {
		StartTime:               "16:10:00",
		EndTime:                 "18:00:00",
		RequiredAssistantNumber: 5,
		ApplicableDays:          []int32{1, 2, 3, 4, 5},
	},
	"19：00-21：00": {
		StartTime:               "19:00:00",
		EndTime:                 "21:00:00",
		RequiredAssistantNumber: 4,
		ApplicableDays:          []int32{1, 2, 3, 4, 5, 6, 7},
	},
}

func SeedRealData(r *repository.Repository) {
	file, err := os.Open("./internal/seed/data/processed.csv")
	if err != nil {
		slog.Error("打开文件失败", "error", err)
		return
	}

	reader := csv.NewReader(file)

	// 读取表头
	headers, err := reader.Read()
	if err != nil {
		slog.Error("读取表头失败", "error", err)
		return
	}

	shiftHeaderArray := []string{}
	infoHeaderArray := []string{}
	for _, header := range headers {
		if strings.Contains(header, "-") {
			// 表示这列是某个班次
			shiftHeaderArray = append(shiftHeaderArray, header)
		} else {
			// 表示这个是信息列
			infoHeaderArray = append(infoHeaderArray, header)
		}
	}

	if len(shiftHeaderArray) == 0 || len(infoHeaderArray) == 0 {
		slog.Error("没有找到班次列或信息列")
		return
	}
	for key := range ShiftHeaderMap {
		if !slices.Contains(shiftHeaderArray, key) {
			slog.Error("没有找到班次列", "key", key)
			return
		}
	}

	// 读取数据
	var records []map[string]string
	for {
		row, err := reader.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			slog.Error("读取文件失败", "error", err)
			return
		}

		record := make(map[string]string)
		for i, value := range row {
			record[headers[i]] = value
		}
		records = append(records, record)
	}

	// 插入排班计划
	st := &domain.ScheduleTemplate{
		Name:        "2025春新学期模板",
		Description: "前台人数从 4 人增加到 5 人，小黑屋人数从 3 人增加到 4 人",
		Shifts:      make([]domain.ScheduleTemplateShift, 0),
	}

	for _, value := range ShiftHeaderMap {
		st.Shifts = append(st.Shifts, value)
	}

	if err := r.CreateScheduleTemplate(st); err != nil {
		slog.Error("插入排班计划失败", "error", err)
		return
	}

	// 插入排班计划
	sp := &domain.SchedulePlan{
		Name:        "2025春季学期排班",
		Description: "本次班表启用时间为2025.2.24-2025.4.27，覆盖了2024年春季学期的第1周至第9周",
		// 这些时间不是准确的时间，只是为了测试
		SubmissionStartTime: time.Now().Add(-time.Hour * 24),
		SubmissionEndTime:   time.Now().Add(time.Hour * 6),
		ActiveStartTime:     time.Now().Add(time.Hour * 24 * 10),
		ActiveEndTime:       time.Now().Add(time.Hour * 24 * 20),
		ScheduleTemplateID:  st.ID,
	}

	if err := r.CreateSchedulePlan(sp); err != nil {
		slog.Error("插入排班计划失败", "error", err)
		return
	}

	// 插入助理及其提交记录到数据库中
	for _, record := range records {
		// 先尝试获取助理
		netID := record["NetID"]
		if netID == "" {
			slog.Error("没有找到NetID", "record", record)
			continue
		}

		user, err := r.GetUserByUsername(netID)
		if err != nil {
			switch {
			case errors.Is(err, sql.ErrNoRows):
				// 表示该助理不在数据库中，需要新建并插入
				user = &domain.User{
					Username:     netID,
					PasswordHash: "$2a$10$aUTaWl3vmXuQFocBkb9Qx.YJPAzNoaAcj2VC5tI45l1Roh24meCgO", // ecnc@test8403
					FullName:     record["姓名"],
					Email:        record["邮箱"],
					Role:         domain.Role(record["角色"]),
				}

				if err := r.CreateUser(user); err != nil {
					slog.Error("插入助理失败", "error", err)
					continue
				}
			default:
				slog.Error("获取助理失败", "error", err)
				continue
			}
		}

		// 插入提交记录
		submission := &domain.AvailabilitySubmission{
			SchedulePlanID: sp.ID,
			UserID:         user.ID,
			Items:          make([]domain.AvailabilitySubmissionItem, 0),
		}

		for _, shiftHeader := range shiftHeaderArray {
			item := domain.AvailabilitySubmissionItem{}

			var shiftID int64 = 0
			for _, shift := range st.Shifts {
				if shift.StartTime == ShiftHeaderMap[shiftHeader].StartTime {
					shiftID = shift.ID
					break
				}
			}

			if shiftID == 0 {
				slog.Error("没有找到班次", "shiftHeader", shiftHeader)
				continue
			}

			item.ShiftID = shiftID
			item.Days = make([]int32, 0)

			for _, day := range strings.Split(record[shiftHeader], ", ") {
				if day == "" {
					continue
				}

				dayInt, err := strconv.Atoi(day)
				if err != nil {
					slog.Error("转换天数失败", "day", day)
					continue
				}

				item.Days = append(item.Days, int32(dayInt))
			}

			submission.Items = append(submission.Items, item)
		}

		if err := r.InsertAvailabilitySubmission(submission); err != nil {
			slog.Error("插入提交记录失败", "error", err)
			continue
		}
	}

	slog.Info("插入数据完成")
}
