resource "aws_launch_configuration" "ecs_launch_config" {
  name_prefix          = var.env
  image_id             = var.instance_ami
  iam_instance_profile = aws_iam_instance_profile.ecs_agent.name
  security_groups      = [aws_security_group.ecs_sg.id]
  user_data = templatefile("${path.module}/files/register-cluster.sh.tftpl", {
    cluster_name = aws_ecs_cluster.ecs_cluster.name
  })
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.generated_key.key_name
  spot_price                  = var.instance_spot_price
  associate_public_ip_address = true
}

resource "aws_autoscaling_group" "ecs_asg" {
  name                 = "${var.env}_autoscaling_group"
  vpc_zone_identifier  = [aws_subnet.pub_subnet.id]
  launch_configuration = aws_launch_configuration.ecs_launch_config.name

  desired_capacity          = 1
  min_size                  = var.asg_min_size
  max_size                  = var.asg_max_size
  health_check_grace_period = 300
  health_check_type         = "EC2"
  protect_from_scale_in     = true

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    propagate_at_launch = false
    value               = var.env
  }
}
