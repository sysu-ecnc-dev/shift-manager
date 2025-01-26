package config

import (
	"errors"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	Environment string `env:"ENVIRONMENT" envDefault:"development"`
	Server      struct {
		Port            string `env:"PORT" envDefault:"3000"`
		ReadTimeout     int    `env:"READ_TIMEOUT" envDefault:"10"`
		WriteTimeout    int    `env:"WRITE_TIMEOUT" envDefault:"15"`
		IdleTimeout     int    `env:"IDLE_TIMEOUT" envDefault:"60"`
		ShutdownTimeout int    `env:"SHUTDOWN_TIMEOUT" envDefault:"10"`
	} `envPrefix:"SERVER_"`
	Database struct {
		DSN                string `env:"DSN,required"`
		ConnectTimeout     int    `env:"CONNECT_TIMEOUT" envDefault:"10"`
		QueryTimeout       int    `env:"QUERY_TIMEOUT" envDefault:"10"`
		TransactionTimeout int    `env:"TRANSACTION_TIMEOUT" envDefault:"20"`
		MaxOpenConns       int    `env:"MAX_OPEN_CONNS" envDefault:"10"`
		MaxIdleConns       int    `env:"MAX_IDLE_CONNS" envDefault:"10"`
		MaxIdleTime        int    `env:"MAX_IDLE_TIME" envDefault:"60"`
	} `envPrefix:"DATABASE_"`
	InitialAdmin struct {
		Username string `env:"USERNAME" envDefault:"admin"`
		Password string `env:"PASSWORD,required"`
		FullName string `env:"FULL_NAME" envDefault:"管理员"`
		Email    string `env:"EMAIL,required"`
	} `envPrefix:"INITIAL_ADMIN_"`
	JWT struct {
		Expiration int    `env:"EXPIRATION" envDefault:"1209600"` // 14 天
		Secret     string `env:"SECRET,required"`
	} `envPrefix:"JWT_"`
	Seed struct {
		User struct {
			Password string `env:"PASSWORD,required"`
		} `envPrefix:"USER_"`
	} `envPrefix:"SEED_"`
	Email struct {
		UserDomain string `env:"USER_DOMAIN,required"`
		SMTP       struct {
			Username    string `env:"USERNAME,required"`
			Password    string `env:"PASSWORD,required"`
			Host        string `env:"HOST,required"`
			Port        int    `env:"PORT" envDefault:"465"`
			DialTimeout int    `env:"DIAL_TIMEOUT" envDefault:"10"`
		} `envPrefix:"SMTP_"`
	} `envPrefix:"EMAIL_"`
	RabbitMQ struct {
		DSN            string `env:"DSN,required"`
		PublishTimeout int    `env:"PUBLISH_TIMEOUT" envDefault:"10"`
	} `envPrefix:"RABBITMQ_"`
	Redis struct {
		Host                string `env:"HOST" envDefault:"localhost"`
		Port                int    `env:"PORT" envDefault:"6379"`
		Password            string `env:"PASSWORD,required"`
		ConnectTimeout      int    `env:"CONNECT_TIMEOUT" envDefault:"10"`
		OperationExpiration int    `env:"OPERATION_EXPIRATION" envDefault:"10"`
	} `envPrefix:"REDIS_"`
	OTP struct {
		Expiration int `env:"EXPIRATION" envDefault:"900"` // 15 分钟
	} `envPrefix:"OTP_"`
	NewUser struct {
		PasswordLength int `env:"PASSWORD_LENGTH" envDefault:"12"`
	} `envPrefix:"NEW_USER_"`
}

func LoadConfig() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		aggErr := env.AggregateError{}
		if ok := errors.As(err, &aggErr); ok {
			// 只返回第一个错误使得日志更清晰
			return nil, aggErr.Errors[0]
		}
	}

	return cfg, nil
}
