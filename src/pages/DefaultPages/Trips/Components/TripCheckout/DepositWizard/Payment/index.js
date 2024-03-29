import React, { PureComponent } from 'react';
import moment from 'moment';
import axios from 'axios';
import cn from 'classnames';
import uuid from 'uuid';
import { Mutation } from 'react-apollo';
import { graphql, compose } from 'react-apollo';
import { Modal, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete, Card, Collapse, Steps, message, Radio } from 'antd';
import BillingProfile from './BillingProfile';
import CheckoutReview from './CheckoutReview';
import CreditCard from './CreditCard';
import PaymentSelector from './PaymentSelector';
import PaymentDetails from './PaymentDetails';
import GraphQLError from '../../../../../../../components/TripValetComponents/Common/GraphQLError';
import { withCheckoutContext } from 'providers/CheckoutProvider';
import { PAY_RESERVATION_DEPOSIT } from '../OrderWizard.mutations.js';

const { Meta } = Card;
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const ccMonth = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};
const ccYear = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};
const cvcFormItem = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};
const doubleFormItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 24,
      offset: 0,
    },
  },
};

@Form.create()
@withCheckoutContext
export default class Payment extends PureComponent {
  state = {
    processingPayment: false,
    errorMessage: '',
  };

  handleSubmit = (e, payReservationDeposit) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {
          checkout: { reservation: { trip, user }, next },
        } = this.props;

        this.setState({ processingPayment: true, errorMessage: '' });
        const hide = message.loading('Processing your Reservation and Payment...', 0);


        const billingAndCard = {
          ...values,
        };

        payReservationDeposit({ variables: { trip, user, billingAndCard } })
          .then(result => {
            this.setState({ processingPayment: false, errorMessage: '' });
            hide();
            if (result.data.payReservationDeposit.success) {
              next();
            }
          })
          .catch(ex => {
            this.setState({ processingPayment: false, errorMessage: ex.message });
            hide();
          });
      }
    });
  };

  goToStep = index => {
    this.props.goToStep(index);
  };

  optionalValidate = (rule, value, callback) => {
    if (!this.state.couponCodeApplied && value) {
      callback();
    } else {
      callback('Required');
    }
  };

  forceValidationFields = () => {
    this.props.form.validateFields(['ccNumber', 'ccExpMonth', 'ccExpYear', 'cvc', 'firstNameOnCard', 'lastNameOnCard', 'ccAddress1', 'ccAddress2', 'ccCity', 'ccState', 'ccPostalCode'], { force: true });
  };

  render() {
    const {
      reservation,
      update,
      trip,
      form: { getFieldDecorator, getFieldValue },
      checkout: { next, previous, getPricing, paymentOption },
    } = this.props;
    let { errorMessage, processingPayment } = this.state;
    const pricing = getPricing();

    return (
      <Row>
        <Col>
          <section className="card">
            <div className="card-header">
              <div className="utils__title">
                <strong>Secure Your Trip With a Deposit</strong>
              </div>
            </div>
            <div className="card-body">
              <Mutation mutation={PAY_RESERVATION_DEPOSIT}>
                {(payReservationDeposit, { loading, error, data }) => (
                  <Form layout="vertical" onSubmit={e => this.handleSubmit(e, payReservationDeposit)}>
                    <div className="step-content">
                      <Row>
                        <Col className="text-center">
                          <h3 className="font-weight-bold">Pay a $200 Deposit to Secure Your Reservation </h3>
                          <div className="mb-4">
                            Once you pay your deposit our customer service will contact you to book your trip.
                          </div>
                        </Col>
                      </Row>
                      <Row gutter={{ xs: 0, sm: 10, md: 25, lg: 40 }}>
                        <Col xs={24}>
                          <BillingProfile form={this.props.form} />
                          <CreditCard form={this.props.form} />
                        </Col>
                      </Row>
                    </div>
                    <Row className="form-actions">
                      <Col>
                        {errorMessage && <GraphQLError message={errorMessage} />}
                        <Button type="primary" icon="rocket" loading={processingPayment} htmlType="submit">
                          Complete Your Reservation | ${paymentOption === 'PaymentPlan' ? pricing.totalDownPayment.toLocaleString('en') : pricing.totalPrice.toLocaleString('en')}.00 Due Today
                        </Button>
                        <Button style={{ marginLeft: 8 }} icon="left-circle" onClick={() => previous()}>
                          Previous
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Mutation>
            </div>
          </section>
        </Col>
      </Row>
    );
  }
}
