# aks.tf (replace your resource with this shape)
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.prefix}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.prefix}-dns"

  default_node_pool {
    name           = "default"
    node_count     = 2
    vm_size        = "standard_a2_v2"
    vnet_subnet_id = azurerm_subnet.aks_subnet.id
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin     = "azure"
    service_cidr       = "10.1.0.0/16" # 👈 must NOT overlap with your VNet/subnets
    dns_service_ip     = "10.1.0.10"
  }

  # New-style addon block (no addon_profile) – just this:
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.la.id
  }

  tags = {
    project = "hrms-advanced"
  }

  # Ensure the workspace is really ready before AKS requests shared keys
  depends_on = [
    time_sleep.after_law
  ]
}
