const React = require('react');
const {withNavigationFocus} = require('@react-navigation/core');
const hoistNonReactStatics = require('hoist-non-react-statics');

module.exports = session => options => Component => {
	class Hoc extends React.Component {
		async startSession() {
			try {
				console.log('started session');
				this.session = await session(options);
			} catch (err) {
				console.log(err);
			}
		}
		componentDidMount() {
			this.startSession();
		}
		endSession() {
			if (this.session) {
				this.session.clear();
				this.session = null;
			}
		}
		componentDidUpdate(prevProps) {
			if (!this.props.isFocused && prevProps.isFocused && this.session) {
				this.endSession();
			}
			if (this.props.isFocused && !prevProps.isFocused && !this.session) {
				this.startSession();
			}
		}
		componentWillUnmount() {
			if (this.session) {
				this.session.clear();
				this.session = null;
			}
		}

		render() {
			return React.createElement(Component, this.props);
		}
	}
	return hoistNonReactStatics(withNavigationFocus(Hoc), Component);
};
