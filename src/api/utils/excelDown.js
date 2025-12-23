import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * 엑셀 다운로드 공통 함수
 * @param {Array} data - 엑셀에 들어갈 데이터 리스트 (예: mockOrders)
 * @param {String} fileName - 다운로드될 파일 이름 (예: 'Orders_20250625')
 * @param {Array} columns - 컬럼 정의 (header: 엑셀표시명, key: 데이터키, width: 너비)
 */
export const excelDown = async (data, fileName, columns) => {
  try {
    // 1. 엑셀 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 2. 컬럼 설정
    worksheet.columns = columns;

    // 3. 데이터 추가
    // (상태값 같은건 엑셀에서 보기 좋게 텍스트로 변환하는 작업이 필요할 수 있음)
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // 4. 스타일링 (Uber 스타일: 헤더를 진하게)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // 흰색 글씨
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' }, // 검은색 배경 (Uber Black)
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 5. 파일 생성 및 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}.xlsx`);
    
  } catch (error) {
    console.error('Excel Download Error:', error);
    alert('엑셀 다운로드 중 오류가 발생했습니다.');
  }
};