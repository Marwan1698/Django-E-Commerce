from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "core"

    def ready(self):
        from django.contrib import admin

        admin.site.site_header = "Bazario admin"
        admin.site.site_title = "Bazario admin"
        admin.site.index_title = "Marketplace"
