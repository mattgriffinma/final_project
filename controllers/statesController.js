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
    if (match?.funfacts?.length) {
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

  if (dbState?.funfacts?.length) {
    return res.json({ ...state, funfacts: dbState.funfacts });
  }

  res.json(state);
};

module.exports = {
  getAllStates,
  getState
};