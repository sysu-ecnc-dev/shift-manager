package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type ServerConfig struct {
	Port         string `mapstructure:"port"`
	ReadTimeout  int    `mapstructure:"read_timeout"`
	WriteTimeout int    `mapstructure:"write_timeout"`
	IdleTimeout  int    `mapstructure:"idle_timeout"`
}

type DatabaseConfig struct {
	ConnectTimeout int    `mapstructure:"connect_timeout"`
	User           string `mapstructure:"user"`
	Password       string `mapstructure:"password"`
	Host           string `mapstructure:"host"`
	Port           int    `mapstructure:"port"`
	DBName         string `mapstructure:"dbname"`
}

type InitialAdminConfig struct {
	Username string `mapstructure:"username"`
	FullName string `mapstructure:"full_name"`
	Password string `mapstructure:"password"`
	Email    string `mapstructure:"email"`
}

type JWTConfig struct {
	Expiration int    `mapstructure:"expiration"`
	Secret     string `mapstructure:"secret"`
}

type SeedConfig struct {
	UserPassword string `mapstructure:"user_password"`
}

type EmailConfig struct {
	UserDomain string `mapstructure:"user_domain"`
}

type Config struct {
	Environment  string             `mapstructure:"environment"`
	Server       ServerConfig       `mapstructure:"server"`
	Database     DatabaseConfig     `mapstructure:"database"`
	InitialAdmin InitialAdminConfig `mapstructure:"initial_admin"`
	JWT          JWTConfig          `mapstructure:"jwt"`
	Seed         SeedConfig         `mapstructure:"seed"`
	Email        EmailConfig        `mapstructure:"email"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	// 读取环境变量并绑定到 viper
	var envMap = map[string]string{
		"database.password":      "DATABASE_PASSWORD",
		"initial_admin.password": "INITIAL_ADMIN_PASSWORD",
		"initial_admin.email":    "INITIAL_ADMIN_EMAIL",
		"jwt.secret":             "JWT_SECRET",
		"seed.user_password":     "SEED_USER_PASSWORD",
	}

	for k, v := range envMap {
		if err := viper.BindEnv(k, v); err != nil {
			return nil, err
		}
		if !viper.IsSet(k) {
			return nil, fmt.Errorf("environment variable %s is not set", v)
		}
	}

	// 解析配置
	cfg := &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}
