# REST Compatibility Notes

REST is not the primary architecture for `radar-claw-defender`.

If a compatibility layer is added later, it should:

- wrap the MCP tool contracts
- preserve the same narrow defensive surface
- avoid adding execution or scanning capability

No REST server is implemented in v1.
