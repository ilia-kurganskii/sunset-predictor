resource "aws_launch_configuration" "ecs_launch_config" {
  image_id                    = "ami-0f51be0cf2e87b06c"
  iam_instance_profile        = aws_iam_instance_profile.ecs_agent.name
  security_groups             = [aws_security_group.ecs_sg.id]
  user_data                   = file("register-cluster.sh")
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.generated_key.key_name
  associate_public_ip_address = true
}

resource "aws_autoscaling_group" "ecs_asg" {
  name                 = "asg"
  vpc_zone_identifier  = [aws_subnet.pub_subnet.id]
  launch_configuration = aws_launch_configuration.ecs_launch_config.name

  desired_capacity          = 1
  min_size                  = 1
  max_size                  = 1
  health_check_grace_period = 300
  health_check_type         = "EC2"
  protect_from_scale_in     = true

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}
