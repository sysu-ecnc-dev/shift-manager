package config

import (
	"fmt"
	"os"
	"slices"
	"strconv"
)

type ServerConfig struct {
	Port         string
	ReadTimeout  int
	WriteTimeout int
	IdleTimeout  int
}

type DatabaseConfig struct {
	User           string
	Password       string
	Host           string
	Port           int
	DBName         string
	ConnectTimeout int
}

type InitialAdminConfig struct {
	Username string
	Password string
	FullName string
	Email    string
}

type JWTConfig struct {
	Expiration int
	Secret     string
}

type SeedConfig struct {
	UserPassword string
}

type EmailConfig struct {
	UserDomain string
}

type Config struct {
	Environment  string
	Server       ServerConfig
	Database     DatabaseConfig
	InitialAdmin InitialAdminConfig
	JWT          JWTConfig
	Seed         SeedConfig
	Email        EmailConfig
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

	// database
	cfg.Database.User, err = getEnvAsString("DATABASE_USER")
	if err != nil {
		return nil, err
	}
	cfg.Database.Password, err = getEnvAsString("DATABASE_PASSWORD")
	if err != nil {
		return nil, err
	}
	cfg.Database.Host, err = getEnvAsString("DATABASE_HOST")
	if err != nil {
		return nil, err
	}
	cfg.Database.Port, err = getEnvAsInt("DATABASE_PORT")
	if err != nil {
		return nil, err
	}
	cfg.Database.DBName, err = getEnvAsString("DATABASE_DBNAME")
	if err != nil {
		return nil, err
	}
	cfg.Database.ConnectTimeout, err = getEnvAsInt("DATABASE_CONNECT_TIMEOUT")
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
	cfg.JWT.Expiration, err = getEnvAsInt("JWT_EXPIRATION")
	if err != nil {
		return nil, err
	}
	cfg.JWT.Secret, err = getEnvAsString("JWT_SECRET")
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
