"""Module registry."""
from typing import Optional
from src.modules.base import BaseModule, ModuleInfo
from src.core.jobs.worker import job_worker
from src.core.jobs.queue import JobQueue


class ModuleRegistry:
    def __init__(self):
        self._modules: dict[str, BaseModule] = {}
        self._job_queue = JobQueue(max_concurrent=1)

    async def initialize(self):
        # Import and register modules here
        # from src.modules.stock_content_factory import StockContentFactoryModule
        # modules = [StockContentFactoryModule(self._job_queue)]
        modules = []

        for module in modules:
            if module.info.enabled:
                await module.initialize()
                module.register_job_executors(job_worker)
                self._modules[module.info.id] = module

    def get_module(self, module_id: str) -> Optional[BaseModule]:
        return self._modules.get(module_id)

    def list_modules(self) -> list[ModuleInfo]:
        return [m.info for m in self._modules.values()]

    def get_enabled_modules(self) -> list[ModuleInfo]:
        return [m.info for m in self._modules.values() if m.info.enabled]


module_registry = ModuleRegistry()