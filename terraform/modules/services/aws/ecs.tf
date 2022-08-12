resource "aws_ecs_cluster" "ecs_cluster" {
  name = "${var.env}_sunset_cluster"
}
