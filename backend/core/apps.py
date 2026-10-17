from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "core"

    def ready(self):
        from django.contrib import admin

        admin.site.site_header = "eStore admin"
        admin.site.site_title = "eStore admin"
        admin.site.index_title = "Marketplace"
