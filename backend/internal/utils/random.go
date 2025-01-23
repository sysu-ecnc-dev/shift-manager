package utils

import (
	"fmt"
	"math/rand"

	"github.com/mozillazg/go-pinyin"
	"github.com/sysu-ecnc-dev/shift-manager/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

func GenerateRandomChineseName() string {
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

	surname := commonSurnames[rand.Intn(len(commonSurnames))]
	nameLength := rand.Intn(2) + 1
	name := ""

	for i := 0; i < nameLength; i++ {
		name += commonNameCharacters[rand.Intn(len(commonNameCharacters))]
	}
	return surname + name
}

func GenerateRandomRole() string {
	var roles = []string{
		NormalAssistantRole,
		SeniorAssistantRole,
		BlackCoreRole,
	}

	return roles[rand.Intn(len(roles))]
}

func GenerateUsernameFromChineseName(chineseName string) string {
	pinyinArray := pinyin.LazyConvert(chineseName, nil)
	username := ""

	for _, pinyin := range pinyinArray {
		length := rand.Intn(len(pinyin)) + 1
		username += pinyin[:length]
	}

	var digits = "0123456789"
	digitsLength := rand.Intn(3) + 1
	for i := 0; i < digitsLength; i++ {
		username += string(digits[rand.Intn(len(digits))])
	}

	return username
}

func GenerateRandomUser(password string, emailDomainName string) (*repository.User, error) {
	fullName := GenerateRandomChineseName()
	username := GenerateUsernameFromChineseName(fullName)
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &repository.User{
		Username:     username,
		PasswordHash: string(passwordHash),
		FullName:     fullName,
		Email:        username + "@" + emailDomainName,
		Role:         GenerateRandomRole(),
	}

	return user, nil
}

func GenerateRandomOTP() string {
	return fmt.Sprintf("%6d", rand.Intn(1000000))
}

func GenerateRandomPassword(length int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*")
	random_password := make([]rune, length)
	for i := range random_password {
		random_password[i] = letters[rand.Intn(len(letters))]
	}
	return string(random_password)
}
