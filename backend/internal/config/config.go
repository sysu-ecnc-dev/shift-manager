package config

import (
	"fmt"
	"os"
	"slices"
	"strconv"
)

type ServerConfig struct {
	Port            string
	ReadTimeout     int
	WriteTimeout    int
	IdleTimeout     int
	ShutdownTimeout int
}

type DatabaseConfig struct {
	DSN            string
	ConnectTimeout int
	QueryTimeout   int
}

type InitialAdminConfig struct {
	Username string
	Password string
	FullName string
	Email    string
}

type JWTAuthConfig struct {
	Expiration int
	Secret     string
}

type JWTConfig struct {
	Auth JWTAuthConfig
}

type SeedConfig struct {
	UserPassword string
}

type SMTPConfig struct {
	Username    string
	Password    string
	Host        string
	Port        int
	DialTimeout int
}

type EmailConfig struct {
	UserDomain string
	SMTP       SMTPConfig
}

type RabbitMQConfig struct {
	DSN            string
	PublishTimeout int
}

type RedisConfig struct {
	Host                string
	Port                int
	Password            string
	ConnectTimeout      int
	OperationExpiration int
}

type OTPConfig struct {
	Expiration int
}

type NewUserConfig struct {
	PasswordLength int
}

type Config struct {
	Environment  string
	Server       ServerConfig
	Database     DatabaseConfig
	InitialAdmin InitialAdminConfig
	JWT          JWTConfig
	Seed         SeedConfig
	Email        EmailConfig
	RabbitMQ     RabbitMQConfig
	Redis        RedisConfig
	OTP          OTPConfig
	NewUser      NewUserConfig
}

func LoadConfig() (*Config, error) {
	// 解析配置
	var err error
	cfg := &Config{}

	// environment
	cfg.Environment, err = getEnvInAllowedValues("ENVIRONMENT", []string{"development", "production"})
	if err != nil {
		return nil, err
	}

	// server
	cfg.Server.Port, err = getEnvAsString("SERVER_PORT")
	if err != nil {
		return nil, err
	}
	cfg.Server.ReadTimeout, err = getEnvAsInt("SERVER_READ_TIMEOUT")
	if err != nil {
		return nil, err
	}
	cfg.Server.WriteTimeout, err = getEnvAsInt("SERVER_WRITE_TIMEOUT")
	if err != nil {
		return nil, err
	}
	cfg.Server.IdleTimeout, err = getEnvAsInt("SERVER_IDLE_TIMEOUT")
	if err != nil {
		return nil, err
	}
	cfg.Server.ShutdownTimeout, err = getEnvAsInt("SERVER_SHUTDOWN_TIMEOUT")
	if err != nil {
		return nil, err
	}

	// database
	cfg.Database.DSN, err = getEnvAsString("DATABASE_DSN")
	if err != nil {
		return nil, err
	}
	cfg.Database.ConnectTimeout, err = getEnvAsInt("DATABASE_CONNECT_TIMEOUT")
	if err != nil {
		return nil, err
	}
	cfg.Database.QueryTimeout, err = getEnvAsInt("DATABASE_QUERY_TIMEOUT")
	if err != nil {
		return nil, err
	}

	// initial admin
	cfg.InitialAdmin.Username, err = getEnvAsString("INITIAL_ADMIN_USERNAME")
	if err != nil {
		return nil, err
	}
	cfg.InitialAdmin.Password, err = getEnvAsString("INITIAL_ADMIN_PASSWORD")
	if err != nil {
		return nil, err
	}
	cfg.InitialAdmin.FullName, err = getEnvAsString("INITIAL_ADMIN_FULL_NAME")
	if err != nil {
		return nil, err
	}
	cfg.InitialAdmin.Email, err = getEnvAsString("INITIAL_ADMIN_EMAIL")
	if err != nil {
		return nil, err
	}

	// JWT
	cfg.JWT.Auth.Expiration, err = getEnvAsInt("JWT_AUTH_EXPIRATION")
	if err != nil {
		return nil, err
	}
	cfg.JWT.Auth.Secret, err = getEnvAsString("JWT_AUTH_SECRET")
	if err != nil {
		return nil, err
	}

	// seed
	cfg.Seed.UserPassword, err = getEnvAsString("SEED_USER_PASSWORD")
	if err != nil {
		return nil, err
	}

	// email
	cfg.Email.UserDomain, err = getEnvAsString("EMAIL_USER_DOMAIN")
	if err != nil {
		return nil, err
	}
	cfg.Email.SMTP.Username, err = getEnvAsString("EMAIL_SMTP_USERNAME")
	if err != nil {
		return nil, err
	}
	cfg.Email.SMTP.Password, err = getEnvAsString("EMAIL_SMTP_PASSWORD")
	if err != nil {
		return nil, err
	}
	cfg.Email.SMTP.Host, err = getEnvAsString("EMAIL_SMTP_HOST")
	if err != nil {
		return nil, err
	}
	cfg.Email.SMTP.Port, err = getEnvAsInt("EMAIL_SMTP_PORT")
	if err != nil {
		return nil, err
	}
	cfg.Email.SMTP.DialTimeout, err = getEnvAsInt("EMAIL_SMTP_DIAL_TIMEOUT")
	if err != nil {
		return nil, err
	}

	// rabbitmq
	cfg.RabbitMQ.DSN, err = getEnvAsString("RABBITMQ_DSN")
	if err != nil {
		return nil, err
	}
	cfg.RabbitMQ.PublishTimeout, err = getEnvAsInt("RABBITMQ_PUBLISH_TIMEOUT")
	if err != nil {
		return nil, err
	}

	// redis
	cfg.Redis.Host, err = getEnvAsString("REDIS_HOST")
	if err != nil {
		return nil, err
	}
	cfg.Redis.Port, err = getEnvAsInt("REDIS_PORT")
	if err != nil {
		return nil, err
	}
	cfg.Redis.Password, err = getEnvAsString("REDIS_PASSWORD")
	if err != nil {
		return nil, err
	}
	cfg.Redis.ConnectTimeout, err = getEnvAsInt("REDIS_CONNECT_TIMEOUT")
	if err != nil {
		return nil, err
	}
	cfg.Redis.OperationExpiration, err = getEnvAsInt("REDIS_OPERATION_EXPIRATION")
	if err != nil {
		return nil, err
	}

	// otp
	cfg.OTP.Expiration, err = getEnvAsInt("OTP_EXPIRATION")
	if err != nil {
		return nil, err
	}

	// new user
	cfg.NewUser.PasswordLength, err = getEnvAsInt("NEW_USER_PASSWORD_LENGTH")
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func getEnvAsString(key string) (string, error) {
	value, ok := os.LookupEnv(key)
	if !ok {
		return "", fmt.Errorf("environment variable %s is not set", key)
	}
	return value, nil
}

func getEnvAsInt(key string) (int, error) {
	value, err := getEnvAsString(key)
	if err != nil {
		return 0, err
	}

	intValue, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("environment variable %s is not a valid integer", key)
	}

	return intValue, nil
}

func getEnvInAllowedValues(key string, allowedValues []string) (string, error) {
	value, err := getEnvAsString(key)
	if err != nil {
		return "", err
	}

	if !slices.Contains(allowedValues, value) {
		return "", fmt.Errorf("environment variable %s is not in allowed values: %v", key, allowedValues)
	}

	return value, nil
}
