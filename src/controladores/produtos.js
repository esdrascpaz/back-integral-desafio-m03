const conexao = require("../conexao");

const listarProdutos = async (req, res) => {
  const { usuario } = req;
  const produtoCategoria = req.query.categoria;
  try {
    if (!produtoCategoria) {
      const query = "select * from produtos where usuario_id=$1";
      const { rows: produtos } = await conexao.query(query, [usuario.id]);
      return res.status(200).json(produtos);
    }
    else{
      const query = `select * from produtos where categoria ilike $1`;
      const { rows: produtos } = await conexao.query(query, [`%${produtoCategoria}%`]);
      if(produtos.length === 0){
        return res.status(404).json({messege: "Categoria não encontrada."})
      }

      const { rows: buscaCategoria, rowCount: ocorrenciaBuscaCategoria } = await conexao.query('SELECT * FROM produtos WHERE categoria ILIKE $1 AND usuario_id = $2', [`%${produtoCategoria}%`, usuario.id]);

            if (ocorrenciaBuscaCategoria === 0) {
                return res.status(403)
                    .json({ mensagem: "Usuário não possui categorias que correspondam aos resultados da busca!" });
            }

      return res.status(200).json(buscaCategoria);
      }
      
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const cadastrarProdutos = async (req, res) => {
  const { usuario } = req;
  const { nome, quantidade, categoria, preco, descricao, imagem} = req.body;
  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
  }
  if (!quantidade) {
    return res.status(400).json({ mensagem: "O campo quantidade é obrigatório" });
  }
  if (quantidade <= 0) {
    return res.status(400).json({
      mensagem: "Por favor, a quantidade do produto deve ser maior do que 0.",
    });
  }
  if (!preco) {
    return res.status(400).json({ mensagem: "O campo preco é obrigatório" });
  }
  if (!descricao) {
    return res.status(400).json({ mensagem: "O campo descricao é obrigatório" });
  }
  try {
    const {rowCount: validarUsuario  } = await conexao.query("Select id, nome, nome_loja, email from usuarios where id = $1",[usuario.id]);
    if( validarUsuario !== 1) {
      return res.status(404).json({messenge: "Usuario não encontrado."});
    }
    const query = `insert into produtos (usuario_id, nome, quantidade, categoria, preco, descricao, imagem)
    values ($1,$2,$3,$4,$5,$6,$7)`;
    const produto = await conexao.query(query, [
      usuario.id,
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
    ]);
    if (produto.rowCount !== 1) {
      return res.status(400).json({ mensagem: "Não foi possível cadastrar os produtos" });
    }
    return res.status(201).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const detalharProduto = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;

  if(isNaN(Number(id)) || Number(id) % 1 !== 0){
    return res.status(400).json({messege: "O id deve ser um numero inteiro."})
  }
  try {
    const query = "select * from produtos where id=$1";
    const {rowCount:produtoValidado} = await conexao.query(query, [id]);
    if (!produtoValidado) {
      return res
        .status(404)
        .json({ mensagem: "Não existe produto cadastrado com esse ID." });
    }
    const {rowCount:ocorrenciaProduto, rows: produto} = await conexao.query("Select * from produtos Where id = $1 and usuario_id = $2",[id, usuario.id]);
    if (!ocorrenciaProduto) {
      return res
        .status(403)
        .json({ mensagem: " Usuario não tem permissão." });
    }
    res.status(200).json(produto[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const atualizarProduto = async (req, res) => {
  const { usuario } = req;
  const  id  = req.params.id && Number(req.params.id);
  const { nome, quantidade, preco, categoria, imagem, descricao } = req.body;

  if(!id || typeof id !== "number"){
    return  res.status(400).json({messege: "ID invalido."})
  }


  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
  }
  if (!quantidade) {
    return res.status(400).json({ mensagem: "O campo quantidade é obrigatório" });
  }
  if (!preco) {
    return res.status(400).json({ mensagem: "O campo preco é obrigatório" });
  }
  if (!descricao) {
    return res.status(400).json({ mensagem: "O campo descricao é obrigatório" });
  }
  if (quantidade <= 0) {
    return res.status(400).json({
      mensagem: "Por favor, a quantidade do produto deve ser maior do que 0.",
    });
  }
  try {
    const queryProcurar =
      "select * from produtos where id = $1";
    const produto = await conexao.query(queryProcurar, [id]);
    if (produto.rowCount === 0) {
      return res.status(404).json({ mensagem: "Não existe produto cadastrado com esse ID." });
    }
    const {rowCount:ocorrenciaProduto} = await conexao.query("Select * from produtos Where id = $1 and usuario_id = $2",[id, usuario.id]);
    if (!ocorrenciaProduto) {
      return res.status(403).json({ mensagem: " Usuario não tem permissão." });
    }
    const query =
      "update produtos set nome=$1, quantidade=$2, categoria=$3, preco=$4, descricao=$5, imagem=$6 where id=$7 and usuario_id=$8";
    const produtoAtualizado = await conexao.query(query, [
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
      id,
      usuario.id,
    ]);
    if (produtoAtualizado.rowCount === 0) {
      return res.status(400).json({ mensagem: "Não foi possível atualizar o produto." });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const excluirProduto = async (req, res) => {
  const { usuario } = req;
  const  id  = req.params.id && Number(req.params.id);

  if(!id || typeof id !== "number"){
    return  res.status(400).json({messege: "ID invalido."})
  } 

  try {
    const queryProcurar =
      "select * from produtos where id = $1";
    const produto = await conexao.query(queryProcurar, [id]);
    if (produto.rowCount === 0) {
      return res
        .status(404).json({ mensagem: "Não existe produto cadastrado com esse Id." });
    }

    const {rowCount:ocorrenciaProduto} = await conexao.query("Select * from produtos Where id = $1 and usuario_id = $2",[id, usuario.id]);
    if (!ocorrenciaProduto) {
      return res
        .status(403).json({ mensagem: " Usuario não tem permissão." });
    }
    
    const query = `delete from produtos where id = $1 and usuario_id = $2`;
    const produtoExcluido = await conexao.query(query, [id, usuario.id]);
    if (produtoExcluido.rowCount === 0) {
      return res
        .status(400).json({ mensagem: "Não foi possível excluir o produto." });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  listarProdutos,
  detalharProduto,
  cadastrarProdutos,
  atualizarProduto,
  excluirProduto,
};
