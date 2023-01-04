/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
module.exports = (db) => {
  router.get('/', (req, res) => {
    res.render('users');
  });

  // route to create menu items /users/createMenu
  router.get('/createMenu', (req, res) => {
    return db
    .query(
      `SELECT *
      FROM menu_items`
      )
    .then((result) => {
      return res.json(result.rows);
    })
  });


  // router.post('/completePersonalInfo', (req, res) => {
  //   return db
  //   .query(
  //     `INSERT INTO USERS (name, phone)
  //     VALUES ($1, $2)
  //     RETURNING ID
  //     `,
  //     []
  //   )
  //   .then((result) => {
  //     console.log("ID pushed to DB")
  //   })
  // });

  // router.post('/completeOrder', (currentCart) => {
  //   return db
  //   .query(
  //     `INSERT INTO ORDERS (total_cost, fees, tax, created)
  //     VALUES ($1, $2, $3, $4)
  //     RETURNING ID
  //     `,
  //     []
  //   )
  //   .then((result) => {
  //     console.log("complete order then push to DB");
  //     orderMenuItems(res);
  //   })
  // });


  // Currently testing
  router.post('/complete_order', (req, res) => {
    console.log(req.body);
    database.addOrderToDatabase()
    .then(user => {
      if (!user) {
        res.send({error: "error"});
        return;
      }
      req.session.userId = user.id;
      res.send("🤗");
    })
    .catch(e => res.send(e));
  });

  router.get('/generateOrders', (req, res) => {
    return db
    .query(`SELECT * FROM orders;`)
    .then((result) => {
      const orders = result.rows;

      return db.query(`SELECT *
      FROM orders_menu_items
      JOIN menu_items ON orders_menu_items.menu_item_id = menu_items.id;`)
      .then((result2) => {
        orders.forEach(order => {
          order.items = getItems(order.id, result2.rows);
        });

        return res.json(orders);

      })
    })
  });

  router.post('/addTime', (req, res) => {
    // increase required_time
    const order_id = req.body["order_id"];

    let additionalTime = req.body["extra-time"];
    additionalTime = additionalTime * 60000;

    return db
    .query(`SELECT * FROM orders WHERE orders.id = $1;`, [order_id])
    .then((result) => {
      // calculate new time
      const reqTime = new Date(result.rows[0].required_time).getTime();
      const newTime = new Date(reqTime + additionalTime);

      const queryParams = [ newTime, order_id ]

      return db
      .query(`UPDATE orders
              SET required_time = $1
              WHERE id = $2
              RETURNING *;`, queryParams)
        .then((result) => {
          return res.redirect('/restaurant');
        })
    })
  });

  const getItems = (orderId, items) => {
    const result = [];
    for (const item of items) {
      if (item.order_id === orderId) {
        result.push(item);
      }
    }

    return result;
  }

  // const orderMenuItems = (orderID) => {
  //   return db
  //   .query(
  //     `INSERT INTO ORDERS_MENU_ITEMS (order_id, menu_item_id, quantity)
  //     VALUES ($1, $2, $3)
  //     `,
  //     [orderID]
  //   )
  //   console.log("complete order then push to DB")
  // };


  return router;
  }
