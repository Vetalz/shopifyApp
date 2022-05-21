import {createStructuredSelector} from "reselect";
import {
  activeCount,
  allCount,
  draftCount,
} from "../../store/reducer/selectors.js";
import {getActiveCount, getAllCount, getDraftCount} from "../../store/reducer/actions.js";
import {connect} from "react-redux";
import {Home} from "./Home.jsx";

const mapStateToProps = createStructuredSelector({
  allCount,
  activeCount,
  draftCount,
});

const mapDispatchToProps = {
  getAllCount,
  getActiveCount,
  getDraftCount
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);