const State = require('../models/State');
const statesData = require('../data/statesData.json');

const findStateData = (code) =>
  statesData.find(state => state.code === code.toUpperCase());

const getAllStates = async (req, res) => {
  const { contig } = req.query;
  let states = statesData;

  if (contig === 'true') {
    states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
  } else if (contig === 'false') {
    states = states.filter(state => state.code === 'AK' || state.code === 'HI');
  }

  const dbStates = await State.find();

  const mergedStates = states.map(state => {
    const match = dbStates.find(s => s.stateCode === state.code);
    // Replace optional chaining with traditional check
    if (match && match.funfacts && match.funfacts.length) {
      return { ...state, funfacts: match.funfacts };
    }
    return state;
  });

  res.json(mergedStates);
};

const getState = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = findStateData(stateCode);

  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  const dbState = await State.findOne({ stateCode });

  // Replace optional chaining with traditional check
  if (dbState && dbState.funfacts && dbState.funfacts.length) {
    return res.json({ ...state, funfacts: dbState.funfacts });
  }

  res.json(state);
};

const getRandomFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = findStateData(stateCode);

  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  const dbState = await State.findOne({ stateCode });

  // Replace optional chaining with traditional check
  if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
    return res.status(404).json({ message: 'No Fun Facts found for ' + state.state });
  }

  const randomFact = dbState.funfacts[Math.floor(Math.random() * dbState.funfacts.length)];
  res.json({ funfact: randomFact });
};

const getCapital = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = findStateData(stateCode);

  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  res.json({ state: state.state, capital: state.capital_city });
};

const getNickname = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = findStateData(stateCode);

  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  res.json({ state: state.state, nickname: state.nickname });
};

const getPopulation = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = findStateData(stateCode);

  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  
  const formattedPopulation = state.population.toLocaleString('en-US');

  res.json({ state: state.state, population: formattedPopulation });
};

const getAdmission = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = findStateData(stateCode);

  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  res.json({ state: state.state, admitted: state.admission_date });
};

const postFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const funfacts = req.body.funfacts;

  if (!funfacts) {
    return res.status(400).json({ message: 'State fun facts value required' });
  }
  
  if (!Array.isArray(funfacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array' });
  }

  let state = await State.findOne({ stateCode });

  if (!state) {
    state = await State.create({ stateCode, funfacts });
  } else {
    state.funfacts.push(...funfacts);
    await state.save();
  }

  res.json(state);
};

const patchFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const { index, funfact } = req.body;
  const stateName = findStateData(stateCode).state;

  if (!index) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  if (!funfact) {
    return res.status(400).json({ message: 'State fun fact value required' });
  }

  const state = await State.findOne({ stateCode });

  if (!state || !state.funfacts || state.funfacts.length === 0) {
    return res.json({ message: `No Fun Facts found for ${stateName}` });
  }

  if (index < 1 || index > state.funfacts.length) {
    //console.log('No Fun Fact found at that index for ${stateName}');
    return res.json({ message: `No Fun Fact found at that index for ${stateName}` });
  }

  state.funfacts[index - 1] = funfact;
  await state.save();
  if(stateCode === 'NE'){
    console.log(index + '\n')
    console.log("patch: " + state);
  }
  
  res.json(state);
};

const deleteFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const stateName = findStateData(stateCode).state;
  const { index } = req.body;

  if (!index) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  const state = await State.findOne({ stateCode });

  if (!state || !state.funfacts || state.funfacts.length === 0) {
    return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
  }

  if (index < 1 || index > state.funfacts.length) {
    //console.log('No Fun Fact found at that index for ${stateName}');
    return res.json({ message: `No Fun Fact found at that index for ${stateName}` });
  }

  state.funfacts.splice(index - 1, 1);
  await state.save();
  if(stateCode === 'NE'){
    console.log(index + '\n')
    console.log("delete: " + state);
  }
  res.json(state);
};

module.exports = {
  getAllStates,
  getState,
  postFunFact,
  patchFunFact,
  deleteFunFact,
  getRandomFunFact,
  getCapital,
  getNickname,
  getPopulation,
  getAdmission
};