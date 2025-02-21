package scheduler

import "github.com/sysu-ecnc-dev/shift-manager/backend/internal/domain"

func isSeniorOrBlackCore(user *domain.User) bool {
	return (user.Role == domain.RoleSeniorAssistant || user.Role == domain.RoleBlackCore)
}
