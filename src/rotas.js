const express = require("express");
const usuarios = require('./controladores/usuarios')
const login = require('./controladores/login')
const produtos = require('./controladores/produtos')
const verificarLogin = require('./intermediario/verificarLogin')
const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);

rotas.post('/login', login.login);

rotas.use(verificarLogin);

rotas.get('/usuario', usuarios.obterUsuario);
rotas.put('/usuario', usuarios.atualizarUsuario);

rotas.get('/produtos', produtos.listarProdutos);
rotas.get('/produtos/:id', produtos.detalharProduto);
rotas.post('/produtos', produtos.cadastrarProdutos);
rotas.put('/produtos/:id', produtos.atualizarProduto);
rotas.delete('/produtos/:id', produtos.excluirProduto);

module.exports = rotas;