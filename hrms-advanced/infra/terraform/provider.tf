terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.9" # latest at time of writing
    }
  }
}


provider "azurerm" {
  features {}
  subscription_id = "644123e0-b57d-4098-b8fd-00a468575012"
}
