import csv
import io
import json
from datetime import datetime, timedelta
from flask import render_template, request, flash, redirect, url_for, make_response, jsonify
from app import app

# Sample data for demos (realistic business data)
sample_products = [
    {"id": 1, "nome": "Camiseta Polo", "categoria": "Roupas", "preco": 45.90, "estoque": 25},
    {"id": 2, "nome": "Tênis Esportivo", "categoria": "Calçados", "preco": 189.90, "estoque": 12},
    {"id": 3, "nome": "Mochila Executiva", "categoria": "Acessórios", "preco": 98.50, "estoque": 8},
    {"id": 4, "nome": "Relógio Digital", "categoria": "Eletrônicos", "preco": 156.00, "estoque": 15},
    {"id": 5, "nome": "Agenda de Couro", "categoria": "Papelaria", "preco": 28.90, "estoque": 30}
]

sample_financial_data = [
    {"data": "2025-01-15", "tipo": "Receita", "categoria": "Vendas", "valor": 2500.00, "descricao": "Vendas do dia"},
    {"data": "2025-01-16", "tipo": "Despesa", "categoria": "Aluguel", "valor": -800.00, "descricao": "Aluguel da loja"},
    {"data": "2025-01-17", "tipo": "Receita", "categoria": "Vendas", "valor": 1800.00, "descricao": "Vendas do dia"},
    {"data": "2025-01-18", "tipo": "Despesa", "categoria": "Fornecedores", "valor": -650.00, "descricao": "Compra de mercadorias"},
    {"data": "2025-01-19", "tipo": "Receita", "categoria": "Vendas", "valor": 3200.00, "descricao": "Vendas do dia"}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solucoes')
def solutions():
    return render_template('solutions.html')

@app.route('/sobre')
def about():
    return render_template('about.html')

@app.route('/contato', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        empresa = request.form.get('empresa')
        mensagem = request.form.get('mensagem')
        
        # Simulate successful form submission
        flash('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success')
        return redirect(url_for('contact'))
    
    return render_template('contact.html')

# Demo Routes
@app.route('/demo/ecommerce')
def demo_ecommerce():
    return render_template('demos/ecommerce.html', products=sample_products)

@app.route('/demo/agenda')
def demo_agenda():
    return render_template('demos/agenda.html')

@app.route('/demo/estoque')
def demo_estoque():
    return render_template('demos/estoque.html', products=sample_products)

@app.route('/demo/financeiro')
def demo_financeiro():
    return render_template('demos/financeiro.html', transactions=sample_financial_data)

@app.route('/demo/restaurante')
def demo_restaurante():
    return render_template('demos/restaurante.html')

@app.route('/demo/erp')
def demo_erp():
    return render_template('demos/erp.html')

@app.route('/demo/oficina')
def demo_oficina():
    return render_template('demos/oficina.html')

@app.route('/demo/imoveis')
def demo_imoveis():
    return render_template('demos/imoveis.html')

@app.route('/demo/academia')
def demo_academia():
    return render_template('demos/academia.html')

# Export functionality
@app.route('/export/csv/<demo_type>')
def export_csv(demo_type):
    output = io.StringIO()
    writer = csv.writer(output)
    
    if demo_type == 'estoque':
        writer.writerow(['ID', 'Produto', 'Categoria', 'Preço', 'Estoque'])
        for product in sample_products:
            writer.writerow([product['id'], product['nome'], product['categoria'], 
                           f"R$ {product['preco']:.2f}", product['estoque']])
        filename = 'relatorio_estoque.csv'
    
    elif demo_type == 'financeiro':
        writer.writerow(['Data', 'Tipo', 'Categoria', 'Valor', 'Descrição'])
        for transaction in sample_financial_data:
            writer.writerow([transaction['data'], transaction['tipo'], transaction['categoria'],
                           f"R$ {transaction['valor']:.2f}", transaction['descricao']])
        filename = 'relatorio_financeiro.csv'
    
    else:
        writer.writerow(['Dados', 'Não disponíveis'])
        filename = 'relatorio.csv'
    
    output.seek(0)
    
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    response.headers["Content-type"] = "text/csv; charset=utf-8"
    
    return response

# API endpoints for chart data
@app.route('/api/chart-data/<chart_type>')
def get_chart_data(chart_type):
    if chart_type == 'vendas-categoria':
        categories = {}
        for product in sample_products:
            if product['categoria'] not in categories:
                categories[product['categoria']] = 0
            categories[product['categoria']] += product['estoque'] * product['preco']
        
        return jsonify({
            'labels': list(categories.keys()),
            'data': list(categories.values())
        })
    
    elif chart_type == 'fluxo-caixa':
        receitas = sum([t['valor'] for t in sample_financial_data if t['valor'] > 0])
        despesas = abs(sum([t['valor'] for t in sample_financial_data if t['valor'] < 0]))
        
        return jsonify({
            'labels': ['Receitas', 'Despesas'],
            'data': [receitas, despesas]
        })
    
    return jsonify({'error': 'Tipo de gráfico não encontrado'})
