resource "aws_db_subnet_group" "rds" {
  name       = "${var.environment_name}"
  subnet_ids = [aws_subnet.private.id]

  tags = {
    Environment = var.environment_name
    user        = var.developer
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.environment_name}-rds"
  vpc_id = aws_vpc.main.id

  tags = {
    Environment = var.environment_name
    user        = var.developer
  }
}

resource "aws_db_instance" "rds" {
  allocated_storage         = 10
  storage_type              = "gp2"
  engine                    = "postgres"
  engine_version            = "10.15"
  instance_class            = "db.t3.micro"
  identifier                = "${var.environment_name}-db"
  username                  = var.database_username
  password                  = var.database_password
  vpc_security_group_ids    = [aws_security_group.rds.id]
  db_subnet_group_name      = aws_db_subnet_group.rds.name
  skip_final_snapshot       = true
  final_snapshot_identifier = "${var.environment_name}-db-snapshot"
  storage_encrypted         = true
  parameter_group_name      = "${var.environment_name}-params"
  ca_cert_identifier        = "rds-ca-2019"
  apply_immediately         = true
  backup_retention_period   = 7
  backup_window             = "02:00-03:00"
  maintenance_window        = "Mon:04:00-Mon:05:00"
  auto_minor_version_upgrade = false

  tags = {
    Environment = var.environment_name
    user        = var.developer
  }

  lifecycle {
    ignore_changes = [allocated_storage]
  }
}