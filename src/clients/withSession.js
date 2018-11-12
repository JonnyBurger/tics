const React = require('react');
const {withNavigationFocus} = require('@react-navigation/core');
const hoistNonReactStatics = require('hoist-non-react-statics');

module.exports = (analytics, options) => Component => {
	class Hoc extends React.Component {
		async startSession() {
			try {
				const session = await analytics.session(options);
				console.log('started session');
				this.session = session;
			} catch (err) {
				console.log(err);
			}
		}
		componentDidMount() {
			this.startSession();
		}
		endSession() {
			this.session.clear();
			this.session = null;
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
			this.session.clear();
			this.session = null;
		}

		render() {
			return React.createElement(Component, this.props);
		}
	}
	return hoistNonReactStatics(withNavigationFocus(Hoc), Component);
};
