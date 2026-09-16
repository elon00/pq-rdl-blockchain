variable "project_id" {
  description = "The Google Cloud Platform project ID"
  type        = string
}

variable "region" {
  description = "GCP Region (Default us-central1 for Always-Free tier)"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "instance_name" {
  description = "Compute Engine instance name"
  type        = string
  default     = "rdl-testnet-node-1"
}
