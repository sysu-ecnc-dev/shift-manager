package config

import "github.com/spf13/viper"

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

type Config struct {
	Environment  string             `mapstructure:"environment"`
	Server       ServerConfig       `mapstructure:"server"`
	Database     DatabaseConfig     `mapstructure:"database"`
	InitialAdmin InitialAdminConfig `mapstructure:"initial_admin"`
	JWT          JWTConfig          `mapstructure:"jwt"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	// 读取环境变量并绑定到 viper
	viper.AutomaticEnv()
	if err := viper.BindEnv("database.password", "DATABASE_PASSWORD"); err != nil {
		return nil, err
	}
	if err := viper.BindEnv("initial_admin.password", "INITIAL_ADMIN_PASSWORD"); err != nil {
		return nil, err
	}
	if err := viper.BindEnv("initial_admin.email", "INITIAL_ADMIN_EMAIL"); err != nil {
		return nil, err
	}
	if err := viper.BindEnv("jwt.secret", "JWT_SECRET"); err != nil {
		return nil, err
	}

	// 解析配置
	cfg := &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}
