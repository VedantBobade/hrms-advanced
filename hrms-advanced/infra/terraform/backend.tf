# By default this project will use the local terraform state (for quick start).
# To switch to Azure Storage backend, uncomment and fill values below and then
# ensure the storage account & container exist (or create them separately).


# terraform {
# backend "azurerm" {
# resource_group_name = "<tfstate-rg>"
# storage_account_name = "<tfstate_sa>"
# container_name = "tfstate"
# key = "hrms-advanced.terraform.tfstate"
# }
# }