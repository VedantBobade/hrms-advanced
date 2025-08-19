resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "${var.prefix}-pg-${substr(replace(uuid(),"-",""),0,6)}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location

  sku_name   = var.postgres_sku_name   # e.g., GP_Standard_D2s_v3
  storage_mb = var.postgres_storage_gb * 1024
  version    = "13"

  administrator_login          = var.postgres_admin
  administrator_password       = var.postgres_password

  zone = "1" # you can spread across zones manually for HA

  high_availability {
    mode = "ZoneRedundant"
  }

  geo_redundant_backup_enabled = false

  tags = {
    project = "hrms-advanced"
  }
}

# 👇 VNet integration (instead of delegated_subnet_resource_id)
resource "azurerm_postgresql_flexible_server_virtual_network_rule" "postgres_vnet_rule" {
  name      = "postgres-vnet-rule"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  subnet_id = azurerm_subnet.postgres_subnet.id
}
