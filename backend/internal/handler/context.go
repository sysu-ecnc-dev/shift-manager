package handler

type ContextKey string

var (
	RoleCtxKey ContextKey = "role"
	SubCtxKey  ContextKey = "sub"
	MyInfoCtx  ContextKey = "myInfo"
)
