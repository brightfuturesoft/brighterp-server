const express = require('express');
const { check_user } = require('../../../hooks/check_user');
const expenses_route = (entityName, crudController) => {
  const router = express.Router();

  // Routes
  router.post(`/create-${entityName}`, check_user, crudController.create);
  router.get(`/get-${entityName}`, check_user, crudController.getAll);
  router.put(`/update-${entityName}`, check_user, crudController.update);
  router.patch(`/delete-${entityName}`, check_user, crudController.delete);

  return router;
};
module.exports = expenses_route;