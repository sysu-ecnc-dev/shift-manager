package utils

import (
	"fmt"
	"math/rand"

	"github.com/mozillazg/go-pinyin"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

var commonSurnames = []string{
	"王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴",
	"徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗",
}
var commonNameCharacters = []string{
	"伟", "强", "芳", "敏", "静", "丽", "刚", "杰", "娟", "勇",
	"艳", "涛", "明", "军", "磊", "洋", "勇", "霞", "飞", "玲",
	"超", "华", "平", "辉", "梅", "鑫", "龙", "鹏", "玉", "斌",
	"庆", "建", "丹", "彬", "凤", "旭", "宁", "乐", "成", "欣",
}

func GenerateRandomChineseName() string {
	surname := commonSurnames[rand.Intn(len(commonSurnames))]
	nameLength := rand.Intn(2) + 1
	name := ""

	for i := 0; i < nameLength; i++ {
		name += commonNameCharacters[rand.Intn(len(commonNameCharacters))]
	}
	return surname + name
}

var roles = []domain.Role{
	domain.RoleNormalAssistant,
	domain.RoleSeniorAssistant,
	domain.RoleBlackCore,
}

func GenerateRandomRole() domain.Role {
	return roles[rand.Intn(len(roles))]
}

var digits = "0123456789"

func GenerateUsernameFromChineseName(chineseName string) string {
	pinyinArray := pinyin.LazyConvert(chineseName, nil)
	username := ""

	for _, pinyin := range pinyinArray {
		length := rand.Intn(len(pinyin)) + 1
		username += pinyin[:length]
	}

	digitsLength := rand.Intn(3) + 1
	for i := 0; i < digitsLength; i++ {
		username += string(digits[rand.Intn(len(digits))])
	}

	return username
}

func GenerateRandomUser(password string, emailDomainName string) (*domain.User, error) {
	fullName := GenerateRandomChineseName()
	username := GenerateUsernameFromChineseName(fullName)
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Username:     username,
		PasswordHash: string(passwordHash),
		FullName:     fullName,
		Email:        username + "@" + emailDomainName,
		Role:         GenerateRandomRole(),
	}

	return user, nil
}

func GenerateRandomOTP() string {
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*")

func GenerateRandomPassword(length int) string {
	random_password := make([]rune, length)
	for i := range random_password {
		random_password[i] = letters[rand.Intn(len(letters))]
	}
	return string(random_password)
}

func GenerateRandomID(letterLength int, digitLength int) string {
	random_id := make([]rune, letterLength+digitLength)
	for i := range random_id {
		if i < letterLength {
			random_id[i] = letters[rand.Intn(len(letters))]
		} else {
			random_id[i] = rune(digits[rand.Intn(len(digits))])
		}
	}
	return string(random_id)
}

// 用 Fisher-Yates 洗牌算法来生成随机的班表应用天数
func GenerateRandomApplicableDays() []int32 {
	days := []int32{1, 2, 3, 4, 5, 6, 7}

	for i := len(days) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		days[i], days[j] = days[j], days[i]
	}

	n := rand.Intn(len(days)) + 1

	return days[:n]
}

func GenerateRandomScheduleTemplate() *domain.ScheduleTemplate {
	stm := domain.ScheduleTemplateMeta{
		Name:        "班表模板" + GenerateRandomID(3, 3),
		Description: "班表模板描述" + GenerateRandomID(20, 10),
	}

	shiftsNum := rand.Intn(6) + 1
	sts := make([]domain.ScheduleTemplateShift, shiftsNum)
	hourPerShift := 24 / shiftsNum

	for i := range sts {
		startHour := i * hourPerShift
		endHour := rand.Intn(hourPerShift) + startHour

		startMinute := rand.Intn(30)    // 0~29
		endMinute := rand.Intn(30) + 30 // 30~59

		sts[i] = domain.ScheduleTemplateShift{
			StartTime:               fmt.Sprintf("%02d:%02d:00", startHour, startMinute),
			EndTime:                 fmt.Sprintf("%02d:%02d:00", endHour, endMinute),
			RequiredAssistantNumber: int32(rand.Intn(10) + 1),
			ApplicableDays:          GenerateRandomApplicableDays(),
		}
	}

	st := domain.ScheduleTemplate{
		Meta:   stm,
		Shifts: sts,
	}

	return &st
}
