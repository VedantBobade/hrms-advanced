resource "azurerm_postgresql_flexible_server" "postgres" {
  depends_on          = [azurerm_virtual_network.vnet]
  name                = "${var.prefix}-pg-${substr(replace(uuid(), "-", ""), 0, 6)}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  administrator_login    = var.postgres_admin
  administrator_password = var.postgres_password

  sku_name   = var.postgres_sku_name
  storage_mb = var.postgres_storage_gb * 1024
  version    = "13"

  zone = "1"

  high_availability {
    mode = "ZoneRedundant"
  }

  geo_redundant_backup_enabled = false

  public_network_access_enabled = true

  tags = {
    project = "hrms-advanced"
  }
}
