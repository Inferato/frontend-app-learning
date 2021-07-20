import React from 'react';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { DataTable } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import AssignmentTypeCell from './AssignmentTypeCell';
import DroppableAssignmentFootnote from './DroppableAssignmentFootnote';
import GradeSummaryTableFooter from './GradeSummaryTableFooter';

import messages from '../messages';

function GradeSummaryTable({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradingPolicy: {
      assignmentPolicies,
    },
    gradesFeatureIsFullyLocked,
    sectionScores,
  } = useModel('progress', courseId);

  const footnotes = [];

  const getFootnoteId = (assignment) => {
    const footnoteId = assignment.shortLabel ? assignment.shortLabel : assignment.type;
    return footnoteId.replace(/[^A-Za-z0-9.-_]+/g, '-');
  };

  const hasNoAccessToAssignmentsOfType = (assignmentType) => {
    const subsectionAssignmentsOfType = sectionScores.map((chapter) => chapter.subsections.filter((subsection) => (
      subsection.assignmentType === assignmentType && subsection.hasGradedAssignment
      && (subsection.numPointsPossible > 0 || subsection.numPointsEarned > 0)
    ))).flat();
    if (subsectionAssignmentsOfType.length) {
      return !subsectionAssignmentsOfType.some((subsection) => (
        subsection.learnerHasAccess === true
      ));
    }
    return false;
  };

  const gradeSummaryData = assignmentPolicies.map((assignment) => {
    let footnoteId = '';
    let footnoteMarker;

    if (assignment.numDroppable > 0) {
      footnoteId = getFootnoteId(assignment);
      footnotes.push({
        id: footnoteId,
        numDroppable: assignment.numDroppable,
        assignmentType: assignment.type,
      });

      footnoteMarker = footnotes.length;
    }

    const locked = !gradesFeatureIsFullyLocked && hasNoAccessToAssignmentsOfType(assignment.type) ? 'locked-overlay' : '';

    return {
      type: {
        footnoteId, footnoteMarker, type: assignment.type, locked,
      },
      weight: { weight: `${(assignment.weight * 100).toFixed(0)}%`, locked },
      grade: { grade: `${(assignment.averageGrade * 100).toFixed(0)}%`, locked },
      weightedGrade: { weightedGrade: `${(assignment.weightedGrade * 100).toFixed(0)}%`, locked },
    };
  });

  return (
    <>
      <DataTable
        data={gradeSummaryData}
        itemCount={gradeSummaryData.length}
        columns={[
          {
            Header: `${intl.formatMessage(messages.assignmentType)}`,
            accessor: 'type',
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <AssignmentTypeCell
                assignmentType={value.type} // eslint-disable-line react/prop-types
                footnoteId={value.footnoteId} // eslint-disable-line react/prop-types
                footnoteMarker={value.footnoteMarker} // eslint-disable-line react/prop-types
                locked={value.locked} // eslint-disable-line react/prop-types
              />
            ),
            headerClassName: 'h5 mb-0',
          },
          {
            Header: `${intl.formatMessage(messages.weight)}`,
            accessor: 'weight',
            headerClassName: 'justify-content-end h5 mb-0',
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <span className={value.locked ? 'locked-overlay' : ''}>{value.weight}</span> // eslint-disable-line react/prop-types
            ),
            cellClassName: 'float-right small',
          },
          {
            Header: `${intl.formatMessage(messages.grade)}`,
            accessor: 'grade',
            headerClassName: 'justify-content-end h5 mb-0',
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <span className={value.locked ? 'locked-overlay' : ''}>{value.grade}</span> // eslint-disable-line react/prop-types
            ),
            cellClassName: 'float-right small',
          },
          {
            Header: `${intl.formatMessage(messages.weightedGrade)}`,
            accessor: 'weightedGrade',
            headerClassName: 'justify-content-end h5 mb-0 text-right',
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <span className={value.locked ? 'locked-overlay' : ''}>{value.weightedGrade}</span> // eslint-disable-line react/prop-types
            ),
            cellClassName: 'float-right font-weight-bold small',
          },
        ]}
      >
        <DataTable.Table />
        <GradeSummaryTableFooter />
      </DataTable>

      {footnotes && (
        <DroppableAssignmentFootnote footnotes={footnotes} />
      )}
    </>
  );
}

GradeSummaryTable.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GradeSummaryTable);
