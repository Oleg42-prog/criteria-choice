import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './uikit.min.css';

class Cell extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
			value: props.value,
        };

		this.handleChange = this.handleChange.bind(this);
    }

	handleChange(event) {
		this.props.onChange(this.props.rowIndex, this.props.colIndex, event.target.value);
		this.setState({value: event.target.value});
	}

	render() {
		return (<td><input className="uk-input uk-form-blank" type="text" placeholder="" value={this.state.value} onChange={this.handleChange}></input></td>)
	}
}

class PseudoCell extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
			value: props.value,
        };

		this.handleFocus = this.handleFocus.bind(this);
		this.handleChange = this.handleChange.bind(this);
    }

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleFocus(event) {
		this.props.callback();
	}

	render() {
		return (<td><input className="uk-input uk-form-blank" type="text" placeholder="" value="" onFocus={this.handleFocus} onChange={this.handleChange}></input></td>)
	}
}

class Table extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
			n: this.props.n,
			m: this.props.m,
			successIndex: -1,
			dangerIndex: -1,
			cells: Array.from(Array(this.props.m), () => new Array(this.props.n)),
			criteria: null,
        };


		const cells = this.state.cells.slice();
		for(let i = 0; i < this.state.m; i++)
		{
			for(let j = 0; j < this.state.n; j++)
			{
				cells[i][j] = 0;
			}
		}

		this.setState({cells: cells});
		this.renderRow = this.renderRow.bind(this);
		this.resize = this.resize.bind(this);
		
		this.laplas = this.laplas.bind(this);
		this.negativeLaplas = this.negativeLaplas.bind(this);

		this.minmax = this.minmax.bind(this);
		this.maxmin = this.maxmin.bind(this);

		this.handleChange = this.handleChange.bind(this);
    }

	handleChange(row, col, value) {
		var cells_ = this.state.cells.slice();
		cells_[row][col] = value;
		this.setState({cells: cells_});
		this.forceUpdate();
	}


	renderCell(i, j) {
		return <Cell onChange={this.handleChange} rowIndex={i} colIndex={j} value={this.state.cells[i][j]} key={i * 1000 + j} />;
	}

	resize(i, j) {
		var cells = this.state.cells.slice();
		var newN = this.state.n;
		var newM = this.state.m;
		if ((i == this.state.m) && (j == this.state.n))
		{
			for(var u = 0; u < this.state.m; u++)
			{
				cells[u].push(null);
			}
			cells.push(Array(this.state.n + 1).fill(null));
			newN ++;
			newM ++;
		}
		else if ((i != this.state.m) && (j == this.state.n))
		{
			for(var u = 0; u < this.state.m; u++)
			{
				cells[u].push(null);
			}
			newN ++;
		}
		else if ((i == this.state.m) && (j != this.state.n))
		{
			cells.push(Array(this.state.n + 1).fill(null));
			newM ++;
		}
		this.setState({cells: cells, n: newN, m: newM});
		this.forceUpdate();
	}

	renderPseudoCell(i, j)
	{
		return <PseudoCell callback={() => {this.resize(i, j)}} key={i * 1000 + j} />;
	}

	renderRow(i, success, danger) {
		let row = [];
		for(let j = 0; j < this.state.n; j++)
		{
			row.push(this.renderCell(i, j));
		}

		row.push(this.renderPseudoCell(i, this.state.n));

		if(i == success)
		{
			return <tr className="success" key={i}><td>A{i + 1}</td>{row}</tr>;
		}
		
		if(i == danger)
		{
			return <tr className="danger" key={i}><td>A{i + 1}</td>{row}</tr>;
		}

		return <tr key={i}><td>A{i + 1}</td>{row}</tr>;
		
	}

	renderPseudoRow(i) {
		let row = [];
		for(let j = 0; j < this.state.n; j++)
		{
			row.push(this.renderPseudoCell(i, j));
		}

		row.push(this.renderPseudoCell(i, this.state.n));

		return <tr key={i}><td></td>{row}</tr>;
	}

	renderHeader() {
		let ths = [];
		ths.push(<th key={0}></th>);
		for(let j = 0; j < this.state.n; j++)
		{
			ths.push(<th className="uk-table-middle" key={j + 1}>S{j + 1}</th>);
		}
		return <tr>{ths}</tr>;
	}

	laplas()
	{
		var cells_ = this.state.cells.slice();
		var n = cells_[0].length;
		var m = cells_.length;

		var max_value = -Infinity;
		var max_row = -1;
		for(var i = 0; i < m; i++)
		{
			let sum = 0;
			for(var j = 0; j < n; j++)
			{
				sum += Number(cells_[i][j]);
			}

			if(sum > max_value)
			{
				max_value = sum;
				max_row = i;
			}
		}

		return max_row;
	}

	negativeLaplas()
	{
		var cells_ = this.state.cells.slice();
		var n = cells_[0].length;
		var m = cells_.length;
		//var p = 1 / n;

		var min_value = +Infinity;
		var min_row = -1;
		for(var i = 0; i < m; i++)
		{
			let sum = 0;
			for(var j = 0; j < n; j++)
			{
				sum += Number(cells_[i][j]);
			}

			if(sum < min_value)
			{
				min_value = sum;
				min_row = i;
			}
		}

		return min_row;
	}

	maxmin()
	{
		var cells_ = this.state.cells.slice();
		var n = cells_[0].length;
		var m = cells_.length;

		var max_value = -Infinity;
		var max_row = -1;
		for(var i = 0; i < m; i++)
		{
			cells_[i].map(Number);
			let min = Math.min(...cells_[i])
			if(min > max_value)
			{
				max_value = min;
				max_row = i;
			}
		}

		return max_row;
	}

	minmax()
	{
		var cells_ = this.state.cells.slice();
		var n = cells_[0].length;
		var m = cells_.length;

		var min_value = +Infinity;
		var min_row = -1;
		for(var i = 0; i < m; i++)
		{
			cells_[i].map(Number);
			let max = Math.max(...cells_[i])
			if(max < min_value)
			{
				min_value = max;
				min_row = i;
			}
		}

		return min_row;
	}

	setCriteria(event) {
		this.setState({criteria: event.target.value});
	}

	render() {
		const rows = [];
		const o = {
			'laplas': this.laplas(),
			'negativeLaplas': this.negativeLaplas(),
			'maxmin': this.maxmin(),
			'minmax': this.minmax(),
		}

		let success = -1, danger = -1;
		if(this.state.criteria === "Laplas")
		{
			success = o['laplas'];
			danger = o['negativeLaplas'];
		}

		if(this.state.criteria === "Vald")
		{
			success = o['maxmin'];
			danger = o['minmax'];
		}

		for (let i = 0; i < this.state.m; i++) {
			rows.push(this.renderRow(i, success, danger));
		}

		rows.push(this.renderPseudoRow(this.state.m));
		
		return (

			<div>
				<div className="uk-padding">
					<h2 className="uk-heading-line uk-text-center"><span>Критериальный выбор</span></h2>
						<table className="uk-table uk-table-middle uk-table-divider">
							<thead>
								{this.renderHeader()}
							</thead>
						
							<tbody>{rows}</tbody>
						</table>

						<div className="uk-form-controls" onChange={this.setCriteria.bind(this)}>
							<label><input className="uk-radio" type="radio" name="radio1" value="Laplas"/> Лапласса <br/></label>
							<span className="uk-label uk-label-success">A{o['laplas'] + 1}</span>
							<span className="uk-label uk-label-danger">A{o['negativeLaplas'] + 1}</span>
							<br/><br/>

							<label><input className="uk-radio" type="radio" name="radio1"  value="Vald"/> Вальда <br/></label>
							<span className="uk-label uk-label-success">A{o['maxmin'] + 1}</span>
							<span className="uk-label uk-label-danger">A{o['minmax'] + 1}</span>
							<br/><br/>

						</div>
					</div>
				</div>
		);	
	}
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Table m={2} n={2} laplas={-1} negativeLaplas={-1}/>);