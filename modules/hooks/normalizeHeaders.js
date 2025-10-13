module.exports = (req, res, next) => {
  const workspaceId =
    req.headers['workspace-id'] ||
    req.headers['workspace_id'] ||
    req.headers['workspaceid'] ||
    req.headers.workspaceid ||
    req.headers.workspace_id ||
    null;
  const authorization =
    req.headers['authorization'] || req.headers.authorization || null;
  req.workspace_id = workspaceId;
  req.auth_token = authorization;
  next();
};
