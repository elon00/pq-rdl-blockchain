output "instance_public_ip" {
  description = "Public IP address of the PQ-RDL node"
  value       = google_compute_instance.rdl_node.network_interface[0].access_config[0].nat_ip
}

output "web_ui_url" {
  description = "URL for the Web UI & JSON-RPC Gateway"
  value       = "http://${google_compute_instance.rdl_node.network_interface[0].access_config[0].nat_ip}:3000"
}

output "p2p_endpoint" {
  description = "HotStuff BFT P2P endpoint"
  value       = "${google_compute_instance.rdl_node.network_interface[0].access_config[0].nat_ip}:7000"
}

output "rpc_endpoint" {
  description = "Native JSON-RPC endpoint"
  value       = "http://${google_compute_instance.rdl_node.network_interface[0].access_config[0].nat_ip}:7100"
}
