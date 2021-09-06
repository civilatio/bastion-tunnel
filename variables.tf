variable "developer" {
    type = string
}

variable "environment_name" {
  type    = string
  default = "dev"
}

variable "ami_id" {
  type        = string
  default     = "ami-07cda0db070313c52"
  description = "Linux AMI id"
}

variable "public_key" {
  type        = string
  description = "Public key to use for bastion host"
}

variable "database_username" {
  type    = string
  default = "postgres"
}

variable "database_password" {
  type = string
  default = "changeme"
}