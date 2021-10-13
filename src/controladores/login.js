const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../secret.js");

const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório" });
  }
  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório" });
  }
  try {
    const consultaEmail = "select * from usuarios where email= $1";
    const { rows, rowCount } = await conexao.query(consultaEmail, [email]);
    if (rowCount!== 1) {
      return res.status(400).json({mensagem: " Usuário e/ou senha incorreto(s)."});
    }
    const usuario = rows[0];
    const senhaComparar = await bcrypt.compare(senha, usuario.senha);
    if (!senhaComparar) {
      return res.status(400).json({mensagem: "Usuário e/ou senha incorreto(s)."});
    }
    const token = jwt.sign(
      { id: usuario.id },
      jwtSecret,
      { expiresIn: "1d" }
    );
    res.status(201).send({token});
  } catch (error) {
    return res.status(404).json({ mensagem: error.message });
  }
};
module.exports = {
  login,
};
