resource "aws_security_group" "bastion" {
  name   = "${var.environment_name}-bastion-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  tags = {
    Environment = var.environment_name
    Bastion     = "true"
    user        = var.developer
  }
}

resource "aws_security_group_rule" "allow_rds_access" {
  type                     = "ingress"
  to_port                  = 5432
  from_port                = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = aws_security_group.rds.id
}

resource "aws_key_pair" "bastion_key" {
  key_name   = "bastion-key"
  public_key = var.public_key
}

resource "aws_instance" "bastion" {
  ami                         = var.ami_id
  instance_type               = "t3a.micro"
  key_name                    = aws_key_pair.bastion_key.key_name
  vpc_security_group_ids      = [
    aws_security_group.bastion.id
  ]
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true

  tags = {
    Environment = var.environment_name
    Name        = "${var.environment_name}-bastion"
    user        = var.developer
  }
}
