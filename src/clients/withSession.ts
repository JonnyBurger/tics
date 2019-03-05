import React, {Attributes} from 'react';
const {withNavigationFocus} = require('@react-navigation/core');
const hoistNonReactStatics = require('hoist-non-react-statics');

type WithSessionProps = {
	isFocused: boolean;
};

export default (session: Session) => (impression: Impression) => (
	Component: React.ComponentClass
) => {
	class Hoc extends React.Component<WithSessionProps> {
		session: SessionResponse | null = null;
		async startSession() {
			try {
				this.session = await session(impression);
				console.log('started session');
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
		componentDidUpdate(prevProps: WithSessionProps) {
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
			return React.createElement(Component, this.props as Attributes);
		}
	}
	return hoistNonReactStatics(withNavigationFocus(Hoc), Component);
};
