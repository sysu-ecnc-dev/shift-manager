package domain

type MailMessage struct {
	Type string `json:"type"`
	To   string `json:"to"`
	Data any    `json:"data"`
}

type CreateUserMailData struct {
	FullName string `json:"fullName"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type ResetPasswordMailData struct {
	FullName   string `json:"fullName"`
	OTP        string `json:"otp"`
	Expiration int    `json:"expiration"`
}

type ChangeEmailMailData struct {
	FullName   string `json:"fullName"`
	OTP        string `json:"otp"`
	Expiration int    `json:"expiration"`
}
