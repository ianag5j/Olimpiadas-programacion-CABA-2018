/*
  En sensorController estaran todos los metodos que podra realizar
  el objeto definido abajo. Estos metodos seran lo que formaran
  parte del CRUD.
*/
const controller = {};

controller.list = (req, res) => {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM sensores', (err, sensores) => {
     if (err) {
      res.json(err);
     }
     res.render('sensores', {
        data: sensores
     });
    });
  });
};

controller.save = (req, res) => {
  const data = req.body;
  console.log(req.body)
  req.getConnection((err, connection) => {
    const query = connection.query('INSERT INTO sensores set ?', data, (err, sensores) => {
      console.log(sensores)
      //res.redirect('/');
      res.redirect('/crud');

    })
  })
};

controller.edit = (req, res) => {
  const { id } = req.params;
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM sensores WHERE id = ?", [id], (err, rows) => {
      res.render('sensores_edit', {
        data: rows[0]
      });
    });
  });
};

controller.update = (req, res) => {
  const { id } = req.params;
  const newSensor = req.body;
  req.getConnection((err, conn) => {

  conn.query('UPDATE sensores set ? where id = ?', [newSensor, id], (err, rows) => {
    //res.redirect('/');
    res.redirect('/crud');
  });
  });
};

controller.delete = (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query('DELETE FROM sensores WHERE id = ?', [id], (err, rows) => {
     // res.redirect('/');
      res.redirect('/crud');

    });
  });
};

controller.search = (req, res) => {
  const data = req.body;
  console.log(req.body);
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM sensores WHERE descripcion LIKE ? ', data, (err, sensores) => {
     if (err) {
      res.json(err);
     }
     res.render('sensores', {
        data: sensores
     });
    });
  });
};

controller.inicio = (req, res) => {
  
     res.render('grafico', {
       
     });
      
};



module.exports = controller;
