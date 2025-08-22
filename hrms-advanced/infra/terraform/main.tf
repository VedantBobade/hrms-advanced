# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-rg"
  location = var.location
}

# Log Analytics
resource "azurerm_log_analytics_workspace" "la" {
  name                = "${var.prefix}-law"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "time_sleep" "after_law" {
  depends_on      = [azurerm_log_analytics_workspace.la]
  create_duration = "20s"
}
