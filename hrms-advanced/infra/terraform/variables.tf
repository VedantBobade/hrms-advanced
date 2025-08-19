variable "prefix" {
  type        = string
  default     = "hrmsadv"
}

variable "location" {
  type        = string
  default     = "West US 3"
}

variable "postgres_admin" {
  type        = string
  description = "Postgres admin username"
}

variable "postgres_password" {
  type        = string
  sensitive   = true
}

variable "postgres_sku_name" {
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "postgres_storage_gb" {
  type        = number
  default     = 32
}
