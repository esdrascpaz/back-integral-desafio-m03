const conexao = require("../conexao");
const bcrypt = require("bcrypt");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha, nome_loja } = req.body;
  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
  }
  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório" });
  }
  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório" });
  }
  if (!nome_loja) {
    return res
      .status(400).json({ mensagem: "O campo nome_loja é obrigatório" });
  }
  try {
    const consultaEmailDoUsuario = "select * from usuarios where email= $1";
    const { rowCount: usuarioQtd } = await conexao.query(
      consultaEmailDoUsuario,
      [email]
    );
    if (usuarioQtd !== 0) {
      return res.status(400).json({mensagem: " Já existe um usuário cadastrado com o e-mail informado."});
    }
    const senhaCript = await bcrypt.hash(senha, 10);
    const query = `insert into usuarios (nome, email, senha, nome_loja)
    values
    ($1,$2,$3,$4)`;
    const usuarioCadastrado = await conexao.query(query, [
      nome,
      email,
      senhaCript,
      nome_loja,
    ]);
    if (usuarioCadastrado.rowCount === 0) {
      return res.status(400).res.json({mensagem: "Não foi possível cadastrar o usuário."});
    }
    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

const obterUsuario = async (req, res) => {
  const { usuario } = req;
  try {
    const { rows, rowCount } = await conexao.query("SELECT id, nome, email, nome_loja FROM usuarios WHERE id = $1", [usuario.id]);

      if (rowCount !== 1 || rows.length !== 1) {
          return res.status(400)
              .json({ mensagem: "Não foi possivel localizar os dados do usuário." });
      }
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};
const atualizarUsuario = async (req, res) => {
  const { usuario } = req;
  const { nome, email, senha, nome_loja } = req.body;
  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
  }
  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório" });
  }
  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório" });
  }
  if (!nome_loja) {
    return res
      .status(404)
      .json({ mensagem: "O campo nome_loja é obrigatório" });
  }
  try {
    const consultaEmailDoUsuario = "select * from usuarios where id <> $1 and email= $2";
    const { rowCount: usuarioQtd } = await conexao.query(
      consultaEmailDoUsuario,
      [usuario.id, email]
    );
    if (usuarioQtd > 0) {
      return res.status(400).json({
        mensagem: " Já existe um usuário cadastrado com o e-mail informado.",
      });
    }
    const senhaCript = await bcrypt.hash(senha, 10);
    const query =
      "update usuarios set nome=$1, email=$2, senha=$3, nome_loja=$4 where id=$5";
    const usuarioAtualizado = await conexao.query(query, [
      nome,
      email,
      senhaCript,
      nome_loja,
      usuario.id,
    ]);
    if (usuarioAtualizado.rowCount === 0) {
      return res.status(400).res.json({
        mensagem: "Não foi possível atualizar o usuário.",
      });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

module.exports = {
  cadastrarUsuario,
  obterUsuario,
  atualizarUsuario,
};
