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

# Sample IA Analytics data
sample_analytics_data = {
    "vendas_mes": [
        {"mes": "Jan", "vendas": 25000, "meta": 20000, "crescimento": 25},
        {"mes": "Fev", "vendas": 28000, "meta": 22000, "crescimento": 12},
        {"mes": "Mar", "vendas": 32000, "meta": 25000, "crescimento": 14},
        {"mes": "Abr", "vendas": 35000, "meta": 28000, "crescimento": 9},
        {"mes": "Mai", "vendas": 38000, "meta": 30000, "crescimento": 8}
    ],
    "insights": [
        {"tipo": "Tendência", "titulo": "Crescimento Consistente", "descricao": "Vendas crescendo 13% ao mês", "impacto": "Alto"},
        {"tipo": "Alerta", "titulo": "Estoque Baixo", "descricao": "3 produtos com estoque crítico", "impacto": "Médio"},
        {"tipo": "Oportunidade", "titulo": "Nova Categoria", "descricao": "Eletrônicos com alta demanda", "impacto": "Alto"},
        {"tipo": "Previsão", "titulo": "Meta Junho", "descricao": "Projeção: R$ 42.000", "impacto": "Informativo"}
    ]
}

# Sample CRM data
sample_crm_data = [
    {"id": 1, "nome": "João Silva", "empresa": "Tech Corp", "status": "Negociação", "valor": 15000, "telefone": "(11) 99999-1111"},
    {"id": 2, "nome": "Maria Santos", "empresa": "Inovação Ltda", "status": "Proposta", "valor": 8500, "telefone": "(11) 99999-2222"},
    {"id": 3, "nome": "Pedro Costa", "empresa": "Digital Solutions", "status": "Qualificado", "valor": 12000, "telefone": "(11) 99999-3333"},
    {"id": 4, "nome": "Ana Lima", "empresa": "StartUp XYZ", "status": "Fechado", "valor": 25000, "telefone": "(11) 99999-4444"},
    {"id": 5, "nome": "Carlos Mendes", "empresa": "Mega Systems", "status": "Contato", "valor": 18000, "telefone": "(11) 99999-5555"}
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

# New Top 3 Systems for 2025
@app.route('/demo/ia-analytics')
def demo_ia_analytics():
    return render_template('demos/ia-analytics.html', 
                         analytics_data=sample_analytics_data,
                         products=sample_products)

@app.route('/demo/crm')
def demo_crm():
    return render_template('demos/crm.html', leads=sample_crm_data)

# Sistemas Famosos - Top 2025
@app.route('/demo/pipedrive-crm')
def demo_pipedrive_crm():
    # Sample Pipedrive-style data with enhanced features
    sample_pipedrive_data = [
        {"id": 1, "nome": "Ana Silva", "empresa": "TechStart", "status": "Negociação", "valor": 25000, "probabilidade": 75, "origem": "Website", "telefone": "(11) 99999-1111"},
        {"id": 2, "nome": "Carlos Santos", "empresa": "Digital Corp", "status": "Proposta Enviada", "valor": 15000, "probabilidade": 60, "origem": "Indicação", "telefone": "(11) 99999-2222"},
        {"id": 3, "nome": "Marina Costa", "empresa": "StartUp XYZ", "status": "Demo Agendada", "valor": 35000, "probabilidade": 40, "origem": "LinkedIn", "telefone": "(11) 99999-3333"},
        {"id": 4, "nome": "Roberto Lima", "empresa": "Innovation Ltd", "status": "Fechado-Ganho", "valor": 50000, "probabilidade": 100, "origem": "Google Ads", "telefone": "(11) 99999-4444"}
    ]
    return render_template('demos/pipedrive-crm.html', leads=sample_pipedrive_data)

@app.route('/demo/hubspot-marketing')
def demo_hubspot_marketing():
    return render_template('demos/hubspot-marketing.html')

@app.route('/demo/slack-comunicacao')
def demo_slack_comunicacao():
    return render_template('demos/slack-comunicacao.html')

@app.route('/demo/trello-projetos')
def demo_trello_projetos():
    return render_template('demos/trello-projetos.html')

@app.route('/demo/quickbooks-contabilidade')
def demo_quickbooks_contabilidade():
    return render_template('demos/quickbooks-contabilidade.html')

@app.route('/demo/shopify-ecommerce')
def demo_shopify_ecommerce():
    return render_template('demos/shopify-ecommerce.html')

@app.route('/demo/zoom-videoconferencia')
def demo_zoom_videoconferencia():
    return render_template('demos/zoom-videoconferencia.html')

@app.route('/demo/whatsapp-business')
def demo_whatsapp_business():
    return render_template('demos/whatsapp-business.html')

@app.route('/demo/google-analytics')
def demo_google_analytics():
    return render_template('demos/google-analytics.html')

@app.route('/demo/salesforce-enterprise')
def demo_salesforce_enterprise():
    return render_template('demos/salesforce-enterprise.html')

# New systems for different niches
@app.route('/demo/clinica-medica')
def demo_clinica_medica():
    return render_template('demos/clinica-medica.html')

@app.route('/demo/escola-online')
def demo_escola_online():
    return render_template('demos/escola-online.html')

@app.route('/demo/delivery')
def demo_delivery():
    return render_template('demos/delivery.html')

@app.route('/demo/pet-shop')
def demo_pet_shop():
    return render_template('demos/pet-shop.html')

@app.route('/demo/agencia-viagem')
def demo_agencia_viagem():
    return render_template('demos/agencia-viagem.html')

@app.route('/demo/contabilidade')
def demo_contabilidade():
    return render_template('demos/contabilidade.html')

@app.route('/demo/advocacia')
def demo_advocacia():
    return render_template('demos/advocacia.html')

@app.route('/demo/marketing-digital')
def demo_marketing_digital():
    return render_template('demos/marketing-digital.html')

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
